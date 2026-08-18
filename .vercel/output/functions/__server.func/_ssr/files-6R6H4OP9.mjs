import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime, a as Overlay2, c as Title2, d as DialogContent$1, f as DialogDescription$1, h as DialogTitle$1, i as Description2, l as Dialog$1, m as DialogPortal$1, n as Cancel, o as Portal2, p as DialogOverlay$1, r as Content2, s as Root2, t as Action, u as DialogClose } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as FileImage, D as ChevronRight, E as CircleCheck, O as ChevronDown, S as FileText, T as Copy, _ as Globe, a as Trash2, f as Lock, l as Search, m as ListFilter, o as SlidersHorizontal, p as LoaderCircle, r as Upload, t as X, v as Folder, w as FileAudio, x as Film, y as FolderPlus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { o as Route$7 } from "./router-DA4Yi6rw.mjs";
import { a as formatBytes, i as copyText, n as buttonVariants, o as formatTimeAgo, r as cn, s as formatTimestamp, t as Button } from "./button-BA6TrrCs.mjs";
import { c as listProjectFiles, d as mintProjectUploadToken, i as deleteProjectFile, m as signProjectFile, o as getProjectOverview } from "./actions-C5eGTJR_.mjs";
import { t as Progress } from "./progress-BsDL2Fel.mjs";
import { t as Input } from "./input-1rg6ADoW.mjs";
import { t as Badge } from "./badge-06aK1Ojp.mjs";
import { t as OpenByteShipClient } from "./sdk-CfZxGCEV.mjs";
import { a as Trigger, i as Root2$1, n as Item2, r as Portal2$1, t as Content2$1 } from "../_libs/@radix-ui/react-dropdown-menu+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/files-6R6H4OP9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KIND_LABEL = {
	image: "Images",
	video: "Videos",
	audio: "Audio",
	doc: "Docs"
};
var KIND_BADGE = {
	image: "Image",
	video: "Video",
	audio: "Audio",
	doc: "Doc"
};
var IMAGE_EXT = /* @__PURE__ */ new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"avif",
	"svg",
	"bmp",
	"heic",
	"tif",
	"tiff"
]);
var VIDEO_EXT = /* @__PURE__ */ new Set([
	"mp4",
	"webm",
	"mov",
	"m4v",
	"mkv",
	"avi"
]);
var AUDIO_EXT = /* @__PURE__ */ new Set([
	"mp3",
	"wav",
	"ogg",
	"m4a",
	"flac",
	"aac",
	"opus"
]);
function extOf(name) {
	const i = name.lastIndexOf(".");
	return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}
function kindOf(contentType, filename = "") {
	const type = contentType.toLowerCase();
	if (type.startsWith("image/")) return "image";
	if (type.startsWith("video/")) return "video";
	if (type.startsWith("audio/")) return "audio";
	const ext = extOf(filename);
	if (IMAGE_EXT.has(ext)) return "image";
	if (VIDEO_EXT.has(ext)) return "video";
	if (AUDIO_EXT.has(ext)) return "audio";
	return "doc";
}
function sanitizeFilename(name) {
	return (name.trim() || "file").replace(/[^A-Za-z0-9._~()-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180) || "file";
}
function sanitizeFolderName(name) {
	return name.trim().replace(/[^A-Za-z0-9._~()-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
function joinPath(folder, name) {
	const file = sanitizeFilename(name);
	return folder ? `${folder}/${file}` : file;
}
function parentFolder(path) {
	const i = path.lastIndexOf("/");
	return i > 0 ? path.slice(0, i) : "";
}
function folderLabel(path) {
	if (!path) return "Root";
	return path.split("/").pop() || path;
}
function viewInFolder(folder, files, extraFolders) {
	const prefix = folder ? `${folder}/` : "";
	const childFolders = /* @__PURE__ */ new Set();
	const childFiles = [];
	for (const file of files) {
		if (folder && !file.path.startsWith(prefix) && file.path !== folder) continue;
		if (!folder && !file.path.includes("/")) {
			childFiles.push(file);
			continue;
		}
		const rest = folder ? file.path.slice(prefix.length) : file.path;
		if (!rest || rest === file.path && folder && file.path !== folder) continue;
		const segs = rest.split("/").filter(Boolean);
		if (segs.length === 1 && file.path !== folder) childFiles.push(file);
		else if (segs.length > 1) childFolders.add(prefix + segs[0]);
	}
	for (const extra of extraFolders) {
		if (extra === folder) continue;
		if (folder) {
			if (!extra.startsWith(prefix)) continue;
			const rest = extra.slice(prefix.length);
			if (rest && !rest.includes("/")) childFolders.add(extra);
		} else if (!extra.includes("/")) childFolders.add(extra);
	}
	return {
		files: childFiles,
		folders: [...childFolders].sort()
	};
}
var FOLDER_KEY = (projectId) => `obs:folders:${projectId}`;
function readStoredFolders(projectId) {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(FOLDER_KEY(projectId));
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((v) => typeof v === "string" && v.length > 0);
	} catch {
		return [];
	}
}
function writeStoredFolders(projectId, folders) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(FOLDER_KEY(projectId), JSON.stringify(folders));
}
var KIND_ICON = {
	image: FileImage,
	video: Film,
	audio: FileAudio,
	doc: FileText
};
function AssetCard({ file, selected, checked, onOpen, onCheck }) {
	const kind = kindOf(file.contentType, file.filename);
	const Icon = KIND_ICON[kind];
	const preview = kind === "image" ? file.url : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("group relative overflow-hidden rounded-lg bg-bg/40 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 ease-[var(--ease-out)]", "hover:shadow-[var(--shadow-border-hover)]", selected && "ring-1 ring-ok"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onOpen,
			className: "block w-full text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-video overflow-hidden bg-elevated",
				children: [preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: preview,
					alt: "",
					className: "size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid size-full place-items-center text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-8",
						strokeWidth: 1.25
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute left-8 top-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "neutral",
						className: "bg-bg/80 backdrop-blur-sm",
						children: KIND_BADGE[kind]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "min-w-0 truncate text-sm font-medium",
						children: file.filename
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						tone: file.visibility === "public" ? "ok" : "neutral",
						className: "shrink-0 normal-case tracking-normal",
						children: [file.visibility === "public" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "mr-1 size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "mr-1 size-3" }), file.visibility]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs text-subtle",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatBytes(file.byteSize) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatTimeAgo(file.createdAt) })]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "absolute left-2 top-2 z-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "sr-only",
				children: ["Select ", file.filename]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked,
				onChange: (e) => {
					e.stopPropagation();
					onCheck(e.currentTarget.checked);
				},
				onClick: (e) => e.stopPropagation(),
				className: "size-4 rounded-xs border-border bg-bg/80 accent-ok"
			})]
		})]
	});
}
function FolderCard({ name, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "flex items-center gap-3 rounded-lg bg-bg/40 px-3 py-3 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-10 place-items-center rounded-md bg-elevated text-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Folder, { className: "size-5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 truncate text-sm font-medium",
			children: name
		})]
	});
}
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
function AlertDialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
		className: cn("fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function AlertDialogContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	})] });
}
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("space-y-1.5", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-5 flex justify-end gap-2", className),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
		className: cn("font-display text-xl tracking-tight", className),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
		className: cn("text-sm text-muted", className),
		...props
	});
}
function AlertDialogAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
		className: cn(buttonVariants(), className),
		...props
	});
}
function AlertDialogCancel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
		className: cn(buttonVariants({ variant: "secondary" }), className),
		...props
	});
}
function AssetDetails({ file, projectId, onClose, onDeleted }) {
	const [signed, setSigned] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const kind = kindOf(file.contentType, file.filename);
	const preview = file.url ?? signed;
	const folder = parentFolder(file.path);
	(0, import_react.useEffect)(() => {
		setSigned(null);
		if (file.url || !file.contentType.startsWith("image/")) return;
		signProjectFile({ data: {
			projectId,
			path: file.path
		} }).then((result) => setSigned(result.signedUrl.url)).catch(() => void 0);
	}, [
		file.path,
		file.url,
		file.contentType,
		projectId
	]);
	async function copyUrl() {
		try {
			if (file.url) {
				await copyText(new URL(file.url, window.location.origin).toString());
				toast.success("URL copied");
				return;
			}
			const result = signed ? { signedUrl: { url: signed } } : await signProjectFile({ data: {
				projectId,
				path: file.path
			} });
			if (!file.url) setSigned(result.signedUrl.url);
			await copyText(new URL(result.signedUrl.url, window.location.origin).toString());
			toast.success(file.visibility === "private" ? "Signed URL copied" : "URL copied");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not copy URL");
		}
	}
	async function onDelete() {
		setBusy(true);
		try {
			await deleteProjectFile({ data: {
				projectId,
				path: file.path
			} });
			toast.success("Deleted");
			setConfirm(false);
			onDeleted();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Delete failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex h-full flex-col overflow-y-auto border-border bg-surface md:border-l",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 px-4 pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Asset details"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Selected file"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "grid size-9 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg",
					"aria-label": "Close details",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-md bg-elevated",
						children: preview && kind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: preview,
							alt: file.filename,
							className: "max-h-64 w-full object-contain outline outline-1 -outline-offset-1 outline-fg/10"
						}) : preview && kind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							src: preview,
							controls: true,
							className: "max-h-64 w-full"
						}) : preview && kind === "audio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
								src: preview,
								controls: true,
								className: "w-full"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid h-36 place-items-center text-sm text-subtle",
							children: "No preview"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: file.visibility === "public" ? "ok" : "neutral",
							className: "gap-1 normal-case tracking-normal",
							children: [file.visibility === "public" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-3" }) : null, file.visibility]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "neutral",
							children: KIND_BADGE[kind]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate font-display text-2xl tracking-tight",
						children: file.filename
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Size",
								value: formatBytes(file.byteSize)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Uploaded",
								value: formatTimestamp(file.createdAt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Folder",
								value: folderLabel(folder)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-xs font-medium uppercase tracking-wider text-subtle",
								children: "File ID"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "mt-1 flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "min-w-0 flex-1 truncate rounded-sm bg-elevated px-2 py-1.5 font-mono text-xs",
									children: file.id
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-9 shrink-0 place-items-center rounded-sm text-muted hover:bg-elevated hover:text-fg",
									"aria-label": "Copy file ID",
									onClick: () => {
										copyText(file.id).then(() => toast.success("File ID copied"));
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" })
								})]
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-sm bg-elevated px-3 py-2 font-mono text-xs text-muted",
						children: file.filename
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							className: "w-full",
							onClick: () => void copyUrl(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copy URL"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "danger",
							className: "w-full",
							onClick: () => setConfirm(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Delete"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: confirm,
				onOpenChange: setConfirm,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete this file?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [file.filename, " will be removed from this project. This cannot be undone."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					disabled: busy,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					className: "bg-danger text-fg hover:opacity-90",
					disabled: busy,
					onClick: (e) => {
						e.preventDefault();
						onDelete();
					},
					children: busy ? "Deleting…" : "Delete"
				})] })] })
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs font-medium uppercase tracking-wider text-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-0.5",
		children: value
	})] });
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, showClose = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, showClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			className: "absolute right-3 top-3 grid size-9 place-items-center rounded-sm text-muted transition-colors hover:bg-elevated hover:text-fg",
			"aria-label": "Close",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
		}) : null]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("font-display text-2xl tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("mt-1.5 text-sm text-muted", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-5 flex items-center justify-end gap-2", className),
		...props
	});
}
function NewFolderDialog({ open, onOpenChange, onCreate }) {
	const [name, setName] = (0, import_react.useState)("");
	const safe = sanitizeFolderName(name);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			if (!next) setName("");
			onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New folder" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a folder in the current location. Names become URL-safe path segments." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4",
				onSubmit: (event) => {
					event.preventDefault();
					if (!safe) return;
					onCreate(safe);
					setName("");
					onOpenChange(false);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-medium uppercase tracking-wider text-subtle",
						htmlFor: "folder-name",
						children: "Folder name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "folder-name",
						className: "mt-1.5",
						value: name,
						autoFocus: true,
						placeholder: "screenshots",
						onChange: (e) => setName(e.target.value)
					}),
					name && safe !== name ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: ["Will be saved as ", safe]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "sm",
						disabled: !safe,
						children: "Create folder"
					})] })
				]
			})]
		})
	});
}
function UploadDialog({ open, onOpenChange, projectId, projectName, folder, onComplete }) {
	const inputRef = (0, import_react.useRef)(null);
	const [items, setItems] = (0, import_react.useState)([]);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [visibility, setVisibility] = (0, import_react.useState)("public");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const queued = items.filter((item) => item.status !== "done");
	const destination = folderLabel(folder);
	function addFiles(list) {
		if (!list) return;
		const next = Array.from(list).map((file) => ({
			id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
			file,
			status: "queued",
			progress: 0
		}));
		setItems((cur) => [...cur, ...next]);
	}
	function reset() {
		setItems([]);
		setDragging(false);
		setBusy(false);
		setVisibility("public");
	}
	async function startUpload() {
		if (!items.length || busy) return;
		setBusy(true);
		try {
			const token = await mintProjectUploadToken({ data: {
				projectId,
				folder: folder || void 0,
				visibility,
				expiresInSeconds: 900
			} });
			const client = new OpenByteShipClient({ uploadToken: token.token });
			let ok = 0;
			let failed = 0;
			for (const item of items) {
				if (item.status === "done") {
					ok += 1;
					continue;
				}
				setItems((cur) => cur.map((row) => row.id === item.id ? {
					...row,
					status: "uploading",
					progress: 0,
					error: void 0
				} : row));
				try {
					await client.upload(item.file, {
						path: joinPath(folder, item.file.name),
						visibility,
						onProgress: (progress) => {
							setItems((cur) => cur.map((row) => row.id === item.id ? {
								...row,
								progress: progress.percent
							} : row));
						}
					});
					ok += 1;
					setItems((cur) => cur.map((row) => row.id === item.id ? {
						...row,
						status: "done",
						progress: 100
					} : row));
				} catch (err) {
					failed += 1;
					setItems((cur) => cur.map((row) => row.id === item.id ? {
						...row,
						status: "error",
						error: err instanceof Error ? err.message : "Upload failed"
					} : row));
				}
			}
			if (failed === 0) {
				toast.success(ok === 1 ? "File uploaded" : `${ok} files uploaded`);
				reset();
				onOpenChange(false);
				onComplete();
			} else {
				toast.error(failed === 1 ? "1 file failed" : `${failed} files failed`);
				onComplete();
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not start upload");
		} finally {
			setBusy(false);
		}
	}
	(0, import_react.useMemo)(() => items.slice(0, 4).map((item) => kindOf(item.file.type, item.file.name)), [items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			if (busy) return;
			if (!next) reset();
			onOpenChange(next);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-md p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Upload files" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
					"Drop files here or click to browse, then upload them into ",
					projectName,
					"."
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-subtle",
							children: "Destination"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: destination
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: ["public", "private"].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: busy,
								onClick: () => setVisibility(value),
								className: cn("h-9 rounded-full px-3 text-xs font-medium capitalize transition-colors", visibility === value ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"),
								children: value
							}, value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: busy,
							onClick: () => inputRef.current?.click(),
							onDragEnter: (e) => {
								e.preventDefault();
								setDragging(true);
							},
							onDragOver: (e) => {
								e.preventDefault();
								setDragging(true);
							},
							onDragLeave: (e) => {
								e.preventDefault();
								if (e.currentTarget.contains(e.relatedTarget)) return;
								setDragging(false);
							},
							onDrop: (e) => {
								e.preventDefault();
								setDragging(false);
								addFiles(e.dataTransfer.files);
							},
							className: cn("flex w-full flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center transition-[border-color,background-color] duration-150", dragging ? "border-accent bg-elevated" : "border-border-strong bg-bg/40 hover:bg-elevated/60"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-11 place-items-center rounded-md bg-ok/15 text-ok",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm font-medium",
									children: "Click to choose files or drop them here"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 max-w-xs text-xs text-subtle",
									children: "Any selected files will be uploaded straight into this project."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: inputRef,
							type: "file",
							multiple: true,
							className: "sr-only",
							onChange: (e) => {
								addFiles(e.currentTarget.files);
								e.currentTarget.value = "";
							}
						}),
						items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-lg bg-bg/50 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium uppercase tracking-wider text-subtle",
									children: "Upload queue"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs uppercase tracking-wider text-subtle",
									children: [
										items.length,
										" ",
										items.length === 1 ? "file" : "files"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-border",
								children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start justify-between gap-3 px-3 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm",
												children: item.file.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-subtle",
												children: formatBytes(item.file.size)
											}),
											item.status === "uploading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
												className: "mt-2",
												value: item.progress
											}) : null,
											item.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-danger",
												children: item.error
											}) : null
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLabel, { item })]
								}, item.id))
							})]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "secondary",
					size: "sm",
					disabled: busy,
					onClick: () => {
						reset();
						onOpenChange(false);
					},
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "sm",
					disabled: !queued.length || busy,
					onClick: () => void startUpload(),
					children: busy ? "Uploading…" : queued.length ? `Upload ${queued.length}` : "Upload"
				})] })
			]
		})
	});
}
function StatusLabel({ item }) {
	if (item.status === "done") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs text-ok",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "Done"]
	});
	if (item.status === "uploading") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-xs text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }),
			Math.round(item.progress),
			"%"
		]
	});
	if (item.status === "error") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-danger",
		children: "Failed"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-muted",
		children: "Queued"
	});
}
var DropdownMenu = Root2$1;
var DropdownMenuTrigger = Trigger;
function DropdownMenuContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal2$1, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
		sideOffset,
		className: cn("z-50 min-w-40 overflow-hidden rounded-md bg-elevated p-1 shadow-[var(--shadow-border)]", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props
	}) });
}
function DropdownMenuItem({ className, inset, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item2, {
		className: cn("flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-sm text-fg outline-none select-none", "focus:bg-surface data-[disabled]:pointer-events-none data-[disabled]:opacity-40", inset && "pl-8", className),
		...props
	});
}
function FilesPage() {
	const { projectId } = Route$7.useParams();
	const [files, setFiles] = (0, import_react.useState)(null);
	const [projectName, setProjectName] = (0, import_react.useState)("project");
	const [folder, setFolder] = (0, import_react.useState)("");
	const [extraFolders, setExtraFolders] = (0, import_react.useState)([]);
	const [query, setQuery] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("all");
	const [visibility, setVisibility] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("newest");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [checked, setChecked] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [folderOpen, setFolderOpen] = (0, import_react.useState)(false);
	const [filesOpen, setFilesOpen] = (0, import_react.useState)(true);
	async function reload() {
		try {
			const [list, overview] = await Promise.all([listProjectFiles({ data: { projectId } }), getProjectOverview({ data: { projectId } })]);
			setFiles(list.files);
			setProjectName(overview.project.name);
			setSelectedId((cur) => cur && list.files.some((file) => file.id === cur) ? cur : null);
		} catch (err) {
			setFiles((cur) => cur ?? []);
			throw err;
		}
	}
	(0, import_react.useEffect)(() => {
		setFolder("");
		setQuery("");
		setKind("all");
		setVisibility("all");
		setSelectedId(null);
		setChecked(/* @__PURE__ */ new Set());
		setExtraFolders(readStoredFolders(projectId));
		reload().catch((err) => toast.error(err.message));
	}, [projectId]);
	const allFiles = files ?? [];
	const view = (0, import_react.useMemo)(() => viewInFolder(folder, allFiles, extraFolders), [
		folder,
		allFiles,
		extraFolders
	]);
	const filtered = (0, import_react.useMemo)(() => {
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
	}, [
		view.files,
		kind,
		visibility,
		query,
		sort
	]);
	const counts = (0, import_react.useMemo)(() => {
		const source = view.files;
		return {
			image: source.filter((f) => kindOf(f.contentType, f.filename) === "image").length,
			video: source.filter((f) => kindOf(f.contentType, f.filename) === "video").length,
			audio: source.filter((f) => kindOf(f.contentType, f.filename) === "audio").length,
			doc: source.filter((f) => kindOf(f.contentType, f.filename) === "doc").length
		};
	}, [view.files]);
	const selected = selectedId ? allFiles.find((file) => file.id === selectedId) ?? null : null;
	const crumbs = folder ? folder.split("/") : [];
	const empty = filtered.length === 0 && view.folders.length === 0;
	function createFolder(name) {
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
			for (const file of targets) await deleteProjectFile({ data: {
				projectId,
				path: file.path
			} });
			toast.success(targets.length === 1 ? "File deleted" : `${targets.length} files deleted`);
			setChecked(/* @__PURE__ */ new Set());
			if (selectedId && ids.includes(selectedId)) setSelectedId(null);
			await reload();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Delete failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-x-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-4xl tracking-tight",
								children: "Assets"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderTrail, {
								crumbs,
								onRoot: () => setFolder(""),
								onCrumb: (index) => setFolder(crumbs.slice(0, index + 1).join("/"))
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "secondary",
									onClick: () => setFolderOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, {}), "Folder"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									onClick: () => setUploadOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Upload"]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 lg:flex-row lg:items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: query,
										onChange: (e) => setQuery(e.target.value),
										placeholder: "Search assets",
										className: "rounded-full pl-9"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterMenu, {
											icon: ListFilter,
											label: kind === "all" ? "All types" : KIND_LABEL[kind],
											options: [
												{
													value: "all",
													label: "All types"
												},
												{
													value: "image",
													label: "Images"
												},
												{
													value: "video",
													label: "Videos"
												},
												{
													value: "audio",
													label: "Audio"
												},
												{
													value: "doc",
													label: "Docs"
												}
											],
											onSelect: (value) => setKind(value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterMenu, {
											icon: Globe,
											label: visibility === "all" ? "All visibility" : visibility === "public" ? "Public" : "Private",
											options: [
												{
													value: "all",
													label: "All visibility"
												},
												{
													value: "public",
													label: "Public"
												},
												{
													value: "private",
													label: "Private"
												}
											],
											onSelect: (value) => setVisibility(value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterMenu, {
											icon: SlidersHorizontal,
											label: sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : "Name",
											options: [
												{
													value: "newest",
													label: "Newest"
												},
												{
													value: "oldest",
													label: "Oldest"
												},
												{
													value: "name",
													label: "Name"
												}
											],
											onSelect: (value) => setSort(value)
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeStat, {
										label: "Images",
										value: counts.image,
										icon: FileImage,
										active: kind === "image",
										onClick: () => setKind(kind === "image" ? "all" : "image")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeStat, {
										label: "Videos",
										value: counts.video,
										icon: Film,
										active: kind === "video",
										onClick: () => setKind(kind === "video" ? "all" : "video")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeStat, {
										label: "Audio",
										value: counts.audio,
										icon: FileAudio,
										active: kind === "audio",
										onClick: () => setKind(kind === "audio" ? "all" : "audio")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeStat, {
										label: "Docs",
										value: counts.doc,
										icon: FileText,
										active: kind === "doc",
										onClick: () => setKind(kind === "doc" ? "all" : "doc")
									})
								]
							})]
						}),
						files === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-48 animate-pulse rounded-xl bg-surface" }) : empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid min-h-36 place-items-center rounded-xl bg-surface px-4 py-10 text-sm text-muted shadow-[var(--shadow-border)]",
							children: "This folder is empty."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 space-y-4",
							children: [view.folders.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mb-3 text-sm text-muted",
									children: ["Folders ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: view.folders.length
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-2 sm:grid-cols-2 xl:grid-cols-3",
									children: view.folders.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderCard, {
										name: folderLabel(path),
										onOpen: () => setFolder(path)
									}, path))
								})]
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "rounded-xl bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "mb-3 flex w-full items-center justify-between text-left text-sm text-muted",
									onClick: () => setFilesOpen((v) => !v),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Files ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: filtered.length
									})] }), filesOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
								}), filesOpen ? filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "py-8 text-center text-sm text-muted",
									children: "No files match these filters."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
									children: filtered.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetCard, {
										file,
										selected: selectedId === file.id,
										checked: checked.has(file.id),
										onOpen: () => setSelectedId(file.id),
										onCheck: (next) => {
											setChecked((cur) => {
												const copy = new Set(cur);
												if (next) copy.add(file.id);
												else copy.delete(file.id);
												return copy;
											});
										}
									}, file.id))
								}) : null]
							})]
						}),
						checked.size > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "sticky bottom-4 z-20 mt-6 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm",
								children: [checked.size, " selected"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									onClick: () => setChecked(/* @__PURE__ */ new Set()),
									children: "Clear"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "danger",
									size: "sm",
									onClick: () => void deleteChecked(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Delete"]
								})]
							})]
						}) : null
					]
				}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "fixed inset-0 z-30 bg-bg/70 lg:hidden",
					"aria-label": "Close details",
					onClick: () => setSelectedId(null)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-hidden shadow-[var(--shadow-border)] lg:sticky lg:top-6 lg:z-10 lg:h-[calc(100vh-3rem)] lg:w-80 lg:shrink-0 lg:self-start lg:rounded-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetDetails, {
						file: selected,
						projectId,
						onClose: () => setSelectedId(null),
						onDeleted: () => {
							setSelectedId(null);
							reload();
						}
					})
				})] }) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDialog, {
				open: uploadOpen,
				onOpenChange: setUploadOpen,
				projectId,
				projectName,
				folder,
				onComplete: () => void reload()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewFolderDialog, {
				open: folderOpen,
				onOpenChange: setFolderOpen,
				onCreate: createFolder
			})
		]
	});
}
function FolderTrail({ crumbs, onRoot, onCrumb }) {
	if (crumbs.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-sm text-muted",
		children: "Root"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "mt-1 flex flex-wrap items-center gap-1 text-sm text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "hover:text-fg",
			onClick: onRoot,
			children: "Root"
		}), crumbs.map((part, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "hover:text-fg",
				onClick: () => onCrumb(index),
				children: part
			})]
		}, `${part}-${index}`))]
	});
}
function FilterMenu({ icon: Icon, label, options, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "inline-flex h-11 items-center gap-2 rounded-full bg-elevated px-3 text-sm text-muted shadow-[var(--shadow-border)] hover:text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" }),
				label,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
		align: "start",
		children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onSelect: () => onSelect(option.value),
			children: option.label
		}, option.value))
	})] });
}
function TypeStat({ label, value, icon: Icon, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("flex items-start justify-between rounded-lg bg-bg/50 px-3 py-3 text-left shadow-[var(--shadow-border)] transition-shadow hover:shadow-[var(--shadow-border-hover)]", active && "ring-1 ring-ok"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-2xl tabular-nums tracking-tight",
			children: value
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-subtle" })]
	});
}
//#endregion
export { FilesPage as component };
