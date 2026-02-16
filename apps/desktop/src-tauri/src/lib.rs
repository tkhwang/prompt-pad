use std::fs;
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_fs::FsExt;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            allow_saved_prompt_dir(&app.handle());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
