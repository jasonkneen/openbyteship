import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sanitizeFolderName } from "@/lib/obs/file-kinds";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
};

export function NewFolderDialog({ open, onOpenChange, onCreate }: Props) {
  const [name, setName] = useState("");
  const safe = sanitizeFolderName(name);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setName("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>Create a folder in the current location. Names become URL-safe path segments.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!safe) return;
            onCreate(safe);
            setName("");
            onOpenChange(false);
          }}
        >
          <label className="text-xs font-medium uppercase tracking-wider text-subtle" htmlFor="folder-name">
            Folder name
          </label>
          <Input
            id="folder-name"
            className="mt-1.5"
            value={name}
            autoFocus
            placeholder="screenshots"
            onChange={(e) => setName(e.target.value)}
          />
          {name && safe !== name ? <p className="mt-2 text-xs text-muted">Will be saved as {safe}</p> : null}
          <DialogFooter>
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!safe}>
              Create folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
