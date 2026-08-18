import type { ImageMetadata } from "./types";

export function isImageContentType(contentType: string): boolean {
  return contentType.startsWith("image/") && !contentType.includes("svg");
}

export function readImageMetadata(bytes: Uint8Array, contentType: string): ImageMetadata | null {
  if (!isImageContentType(contentType)) return null;
  const dims = readDimensions(bytes);
  if (!dims) return null;
  return { width: dims.width, height: dims.height };
}

function readDimensions(bytes: Uint8Array): { width: number; height: number } | null {
  if (bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    const width = readU32(bytes, 16);
    const height = readU32(bytes, 20);
    return width && height ? { width, height } : null;
  }
  if (bytes.length >= 30 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return { width: readU16LE(bytes, 6), height: readU16LE(bytes, 8) };
  }
  if (bytes.length >= 30 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return readJpegSize(bytes);
  }
  if (bytes.length >= 30 && bytes[0] === 0x52 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return readWebpSize(bytes);
  }
  return null;
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1]!;
    const size = readU16BE(bytes, offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: readU16BE(bytes, offset + 5), width: readU16BE(bytes, offset + 7) };
    }
    offset += 2 + size;
  }
  return null;
}

function readWebpSize(bytes: Uint8Array): { width: number; height: number } | null {
  const chunk = String.fromCharCode(bytes[12] ?? 0, bytes[13] ?? 0, bytes[14] ?? 0, bytes[15] ?? 0);
  if (chunk === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16);
    const height = 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16);
    return { width, height };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return { width: readU16LE(bytes, 26) & 0x3fff, height: readU16LE(bytes, 28) & 0x3fff };
  }
  return null;
}

function readU16LE(bytes: Uint8Array, offset: number) {
  return bytes[offset]! | (bytes[offset + 1]! << 8);
}
function readU16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset]! << 8) | bytes[offset + 1]!;
}
function readU32(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset]! << 24) |
    (bytes[offset + 1]! << 16) |
    (bytes[offset + 2]! << 8) |
    bytes[offset + 3]!
  ) >>> 0;
}
