import path from "path";

export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "public", "uploads");
}

export function getUploadPublicPath(fileName: string): string {
  return path.join("uploads", fileName);
}

export function resolveStoredFilePath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  if (filePath.startsWith("uploads/") || filePath.startsWith("uploads\\")) {
    return path.join(getUploadDir(), path.basename(filePath));
  }
  return path.join(process.cwd(), "public", filePath);
}
