use std::fs;
use std::io::{self, BufReader};
use std::path::{Path, PathBuf};
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_fs::FsExt;
use zip::write::SimpleFileOptions;

fn allow_saved_prompt_dir<R: Runtime>(app: &AppHandle<R>) {
    let settings_path = match app.path().resolve("settings.json", BaseDirectory::AppData) {
        Ok(path) => path,
        Err(err) => {
            eprintln!("failed to resolve settings store path: {err}");
            return;
        }
    };

    let settings = match fs::read_to_string(&settings_path) {
        Ok(contents) => contents,
        Err(_) => return,
    };

    let prompt_dir = match serde_json::from_str::<serde_json::Value>(&settings)
        .ok()
        .and_then(|json| {
            json.get("promptDir")
                .and_then(|value| value.as_str())
                .map(ToOwned::to_owned)
        }) {
        Some(path) if !path.trim().is_empty() => path,
        _ => return,
    };

    let prompt_dir = PathBuf::from(prompt_dir);
    if !prompt_dir.is_absolute() {
        eprintln!("ignoring non-absolute prompt directory from settings");
        return;
    }

    if let Err(err) = app.fs_scope().allow_directory(prompt_dir, true) {
        eprintln!("failed to allow prompt directory scope: {err}");
    }
}

fn collect_files(dir: &Path, files: &mut Vec<PathBuf>) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {e}"))?;
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {e}"))?;
        let path = entry.path();
        let metadata = fs::symlink_metadata(&path)
            .map_err(|e| format!("Failed to read metadata: {e}"))?;

        if metadata.file_type().is_symlink() {
            continue;
        }

        if metadata.is_dir() {
            collect_files(&path, files)?;
        } else {
            files.push(path);
        }
    }
    Ok(())
}

#[tauri::command]
fn export_data_zip(app: AppHandle, source_dir: String, output_path: String) -> Result<(), String> {
    let source = Path::new(&source_dir)
        .canonicalize()
        .map_err(|e| format!("Invalid source directory: {e}"))?;

    let scope = app.fs_scope();

    if !scope.is_allowed(&source) {
        return Err("Source directory is not in allowed scope".into());
    }

    let output = Path::new(&output_path);
    if let Some(parent) = output.parent() {
        let canonical_parent = parent
            .canonicalize()
            .map_err(|e| format!("Invalid output path: {e}"))?;
        if !scope.is_allowed(&canonical_parent) {
            return Err("Output path is not in allowed scope".into());
        }
    }

    if !source.is_dir() {
        return Err("Source directory does not exist".into());
    }

    let mut files = Vec::new();
    collect_files(&source, &mut files)?;

    let file = fs::File::create(&output_path).map_err(|e| format!("Failed to create zip file: {e}"))?;
    let mut zip = zip::ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);

    for path in &files {
        let relative = path.strip_prefix(&source).map_err(|e| format!("Path error: {e}"))?;
        let name = relative.to_string_lossy().replace('\\', "/");
        zip.start_file(&*name, options).map_err(|e| format!("Failed to add file to zip: {e}"))?;
        let mut reader = BufReader::new(
            fs::File::open(path).map_err(|e| format!("Failed to open file: {e}"))?,
        );
        io::copy(&mut reader, &mut zip).map_err(|e| format!("Failed to write to zip: {e}"))?;
    }

    zip.finish().map_err(|e| format!("Failed to finalize zip: {e}"))?;
    Ok(())
}

const IGNORED_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "target",
    "dist",
    "build",
    "__pycache__",
    ".next",
    ".nuxt",
    ".output",
    ".venv",
    "venv",
    ".tox",
    ".mypy_cache",
    ".pytest_cache",
    ".cache",
    ".turbo",
    "coverage",
];

fn collect_repo_files(
    dir: &Path,
    root: &Path,
    files: &mut Vec<String>,
    max_files: usize,
) -> Result<(), String> {
    if files.len() >= max_files {
        return Ok(());
    }
    let entries = fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {e}"))?;
    for entry in entries {
        if files.len() >= max_files {
            return Ok(());
        }
        let entry = entry.map_err(|e| format!("Failed to read entry: {e}"))?;
        let path = entry.path();
        let metadata = match fs::symlink_metadata(&path) {
            Ok(m) => m,
            Err(_) => continue,
        };
        if metadata.file_type().is_symlink() {
            continue;
        }
        if metadata.is_dir() {
            let dir_name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();
            if IGNORED_DIRS.contains(&dir_name.as_str()) {
                continue;
            }
            collect_repo_files(&path, root, files, max_files)?;
        } else {
            let relative = path
                .strip_prefix(root)
                .map_err(|e| format!("Path error: {e}"))?;
            files.push(relative.to_string_lossy().replace('\\', "/"));
        }
    }
    Ok(())
}

#[tauri::command]
fn list_repo_files(repo_dir: String, max_files: Option<usize>) -> Result<Vec<String>, String> {
    let root = Path::new(&repo_dir);
    if !root.is_dir() {
        return Err("Repository directory does not exist".into());
    }
    let limit = max_files.unwrap_or(10_000);
    let mut files = Vec::new();
    collect_repo_files(root, root, &mut files, limit)?;
    files.sort();
    Ok(files)
}

#[tauri::command]
fn get_distribution_channel() -> &'static str {
    if cfg!(feature = "app-store") {
        "mas"
    } else {
        "direct"
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![export_data_zip, get_distribution_channel, list_repo_files])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(all(desktop, not(feature = "app-store")))]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;
            allow_saved_prompt_dir(&app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
