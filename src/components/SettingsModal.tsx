import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { open } from "@tauri-apps/plugin-dialog";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rootDir: string;
  onDirChange: (dir: string) => void;
}

export function SettingsModal({
  open: isOpen,
  onOpenChange,
  rootDir,
  onDirChange,
}: SettingsModalProps) {
  const [dir, setDir] = useState(rootDir);

  const handleBrowse = async () => {
    const selected = await open({
      title: "Select Prompt Storage Directory",
      directory: true,
    });
    if (selected) {
      setDir(selected as string);
    }
  };

  const handleSave = () => {
    onDirChange(dir);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt Storage Directory</label>
          <div className="flex gap-2">
            <Input value={dir} onChange={(e) => setDir(e.target.value)} className="flex-1" />
            <Button variant="outline" onClick={handleBrowse}>
              Browse
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Prompts are stored as Markdown files in this directory.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
