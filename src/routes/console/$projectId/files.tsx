import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  FileAudio,
  FileImage,
  FileText,
  Film,
  FolderPlus,
  Globe,
  ListFilter,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { AssetCard, FolderCard } from "@/components/console/assets/asset-card";
import { AssetDetails } from "@/components/console/assets/asset-details";
import { NewFolderDialog } from "@/components/console/assets/new-folder-dialog";
import { UploadDialog } from "@/components/console/assets/upload-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getProjectOverview, listProjectFiles, deleteProjectFile } from "@/lib/obs/actions";
import {
  KIND_LABEL,
  folderLabel,
  kindOf,
  readStoredFolders,
  viewInFolder,
  writeStoredFolders,
  type AssetKind,
} from "@/lib/obs/file-kinds";
import type { FileRecord } from "@/lib/obs/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/console/$projectId/files")({ component: FilesPage });

type KindFilter = "all" | AssetKind;
type VisibilityFilter = "all" | "public" | "private";
type SortKey = "newest" | "oldest" | "name";

function FilesPage() {
  const { projectId } = Route.useParams();
  const [files, setFiles] = useState<FileRecord[] | null>(null);
  const [projectName, setProjectName] = useState("project");
  const [folder, setFolder] = useState("");
  const [extraFolders, setExtraFolders] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(true);

  async function reload() {
    try {
      const [list, overview] = await Promise.all([
        listProjectFiles({ data: { projectId } }),
        getProjectOverview({ data: { projectId } }),
      ]);
      setFiles(list.files);
      setProjectName(overview.project.name);
      setSelectedId((cur) => (cur && list.files.some((file) => file.id === cur) ? cur : null));
    } catch (err) {
      setFiles((cur) => cur ?? []);
      throw err;
    }
  }

  useEffect(() => {
    setFolder("");
    setQuery("");
    setKind("all");
    setVisibility("all");
    setSelectedId(null);
    setChecked(new Set());
    setExtraFolders(readStoredFolders(projectId));
    void reload().catch((err: Error) => toast.error(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const allFiles = files ?? [];
  const view = useMemo(() => viewInFolder(folder, allFiles, extraFolders), [folder, allFiles, extraFolders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = view.files.filter((file) => {
      if (kind !== "all" && kindOf(file.contentType, file.filename) !== kind) return false;
      if (visibility !== "all" && file.visibility !== visibility) return false;
      if (q && !file.filename.toLowerCase().includes(q) && !file.path.toLowerCase().includes(q)) return false;
      return true;
    });
    rows.sort((a, b) => {
      if (sort === "name") return a.filename.localeCompare(b.filename);
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sort === "oldest" ? da - db : db - da;
    });
    return rows;
  }, [view.files, kind, visibility, query, sort]);

  const counts = useMemo(() => {
    const source = view.files;
    return {
      image: source.filter((f) => kindOf(f.contentType, f.filename) === "image").length,
      video: source.filter((f) => kindOf(f.contentType, f.filename) === "video").length,
      audio: source.filter((f) => kindOf(f.contentType, f.filename) === "audio").length,
      doc: source.filter((f) => kindOf(f.contentType, f.filename) === "doc").length,
    };
  }, [view.files]);

  const selected = selectedId ? (allFiles.find((file) => file.id === selectedId) ?? null) : null;
  const crumbs = folder ? folder.split("/") : [];
  const empty = filtered.length === 0 && view.folders.length === 0;

  function createFolder(name: string) {
    const path = folder ? `${folder}/${name}` : name;
    if (extraFolders.includes(path) || view.folders.includes(path)) {
      toast.error("Folder already exists");
      return;
    }
    const next = [...extraFolders, path];
    setExtraFolders(next);
    writeStoredFolders(projectId, next);
    setFolder(path);
    toast.success("Folder created");
  }

  async function deleteChecked() {
    const ids = [...checked];
    if (!ids.length) return;
    const targets = allFiles.filter((file) => ids.includes(file.id));
    try {
      for (const file of targets) {
        await deleteProjectFile({ data: { projectId, path: file.path } });
      }
      toast.success(targets.length === 1 ? "File deleted" : `${targets.length} files deleted`);
      setChecked(new Set());
      if (selectedId && ids.includes(selectedId)) setSelectedId(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="relative overflow-x-hidden">
      <div className="flex items-start gap-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-4xl tracking-tight">Assets</h1>
              <FolderTrail
                crumbs={crumbs}
                onRoot={() => setFolder("")}
                onCrumb={(index) => setFolder(crumbs.slice(0, index + 1).join("/"))}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setFolderOpen(true)}>
                <FolderPlus />
                Folder
              </Button>
              <Button type="button" onClick={() => setUploadOpen(true)}>
                <Upload />
                Upload
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search assets"
                  className="rounded-full pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterMenu
                  icon={ListFilter}
                  label={kind === "all" ? "All types" : KIND_LABEL[kind]}
                  options={[
                    { value: "all", label: "All types" },
                    { value: "image", label: "Images" },
                    { value: "video", label: "Videos" },
                    { value: "audio", label: "Audio" },
                    { value: "doc", label: "Docs" },
                  ]}
                  onSelect={(value) => setKind(value as KindFilter)}
                />
                <FilterMenu
                  icon={Globe}
                  label={visibility === "all" ? "All visibility" : visibility === "public" ? "Public" : "Private"}
                  options={[
                    { value: "all", label: "All visibility" },
                    { value: "public", label: "Public" },
                    { value: "private", label: "Private" },
                  ]}
                  onSelect={(value) => setVisibility(value as VisibilityFilter)}
                />
                <FilterMenu
                  icon={SlidersHorizontal}
                  label={sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : "Name"}
                  options={[
                    { value: "newest", label: "Newest" },
                    { value: "oldest", label: "Oldest" },
                    { value: "name", label: "Name" },
                  ]}
                  onSelect={(value) => setSort(value as SortKey)}
                />
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <TypeStat
                label="Images"
                value={counts.image}
                icon={FileImage}
                active={kind === "image"}
                onClick={() => setKind(kind === "image" ? "all" : "image")}
              />
              <TypeStat
                label="Videos"
                value={counts.video}
                icon={Film}
                active={kind === "video"}
                onClick={() => setKind(kind === "video" ? "all" : "video")}
              />
              <TypeStat
                label="Audio"
                value={counts.audio}
                icon={FileAudio}
                active={kind === "audio"}
                onClick={() => setKind(kind === "audio" ? "all" : "audio")}
              />
              <TypeStat
                label="Docs"
                value={counts.doc}
                icon={FileText}
                active={kind === "doc"}
                onClick={() => setKind(kind === "doc" ? "all" : "doc")}
              />
            </div>
          </div>

          {files === null ? (
            <div className="mt-6 h-48 animate-pulse rounded-xl bg-surface" />
          ) : empty ? (
            <div className="mt-6 grid min-h-36 place-items-center rounded-xl bg-surface px-4 py-10 text-sm text-muted shadow-[var(--shadow-border)]">
              This folder is empty.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {view.folders.length > 0 ? (
                <section className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
                  <p className="mb-3 text-sm text-muted">
                    Folders <span className="text-fg">{view.folders.length}</span>
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {view.folders.map((path) => (
                      <FolderCard key={path} name={folderLabel(path)} onOpen={() => setFolder(path)} />
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4">
                <button
                  type="button"
                  className="mb-3 flex w-full items-center justify-between text-left text-sm text-muted"
                  onClick={() => setFilesOpen((v) => !v)}
                >
                  <span>
                    Files <span className="text-fg">{filtered.length}</span>
                  </span>
                  {filesOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
                {filesOpen ? (
                  filtered.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted">No files match these filters.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {filtered.map((file) => (
                        <AssetCard
                          key={file.id}
                          file={file}
                          selected={selectedId === file.id}
                          checked={checked.has(file.id)}
                          onOpen={() => setSelectedId(file.id)}
                          onCheck={(next) => {
                            setChecked((cur) => {
                              const copy = new Set(cur);
                              if (next) copy.add(file.id);
                              else copy.delete(file.id);
                              return copy;
                            });
                          }}
                        />
                      ))}
                    </div>
                  )
                ) : null}
              </section>
            </div>
          )}

          {checked.size > 0 ? (
            <div className="sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-[var(--shadow-border)]">
              <p className="text-sm">{checked.size} selected</p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setChecked(new Set())}>
                  Clear
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={() => void deleteChecked()}>
                  <Trash2 />
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {selected ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-30 bg-bg/70 lg:hidden"
              aria-label="Close details"
              onClick={() => setSelectedId(null)}
            />
            <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-hidden shadow-[var(--shadow-border)] lg:sticky lg:top-6 lg:z-10 lg:h-[calc(100vh-3rem)] lg:w-80 lg:shrink-0 lg:self-start lg:rounded-xl">
              <AssetDetails
                file={selected}
                projectId={projectId}
                onClose={() => setSelectedId(null)}
                onDeleted={() => {
                  setSelectedId(null);
                  void reload();
                }}
              />
            </div>
          </>
        ) : null}
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projectId={projectId}
        projectName={projectName}
        folder={folder}
        onComplete={() => void reload()}
      />
      <NewFolderDialog open={folderOpen} onOpenChange={setFolderOpen} onCreate={createFolder} />
    </div>
  );
}

function FolderTrail({
  crumbs,
  onRoot,
  onCrumb,
}: {
  crumbs: string[];
  onRoot: () => void;
  onCrumb: (index: number) => void;
}) {
  if (crumbs.length === 0) {
    return <p className="mt-1 text-sm text-muted">Root</p>;
  }
  return (
    <nav className="mt-1 flex flex-wrap items-center gap-1 text-sm text-muted">
      <button type="button" className="hover:text-fg" onClick={onRoot}>
        Root
      </button>
      {crumbs.map((part, index) => (
        <span key={`${part}-${index}`} className="flex items-center gap-1">
          <ChevronRight className="size-3.5" />
          <button type="button" className="hover:text-fg" onClick={() => onCrumb(index)}>
            {part}
          </button>
        </span>
      ))}
    </nav>
  );
}

function FilterMenu({
  icon: Icon,
  label,
  options,
  onSelect,
}: {
  icon: typeof ListFilter;
  label: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-elevated px-3 text-sm text-muted shadow-[var(--shadow-border)] hover:text-fg"
        >
          <Icon className="size-3.5" />
          {label}
          <ChevronDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onSelect={() => onSelect(option.value)}>
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TypeStat({
  label,
  value,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof FileImage;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start justify-between rounded-lg bg-bg/50 px-3 py-3 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
        active && "ring-1 ring-ok",
      )}
    >
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-2 font-display text-2xl tabular-nums tracking-tight">{value}</p>
      </div>
      <Icon className="size-4 text-subtle" />
    </button>
  );
}
