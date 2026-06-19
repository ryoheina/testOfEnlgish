import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getUploadDir, getUploadPublicPath } from "@/lib/uploads";

export async function GET() {
  try {
    const files = await prisma.downloadableFile.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Files fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || "10", 10) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 10}MB limit` },
        { status: 400 }
      );
    }

    const uploadDir = getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = getUploadPublicPath(uniqueName);
    const fullPath = path.join(uploadDir, uniqueName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(fullPath, buffer);

    const downloadableFile = await prisma.downloadableFile.create({
      data: {
        fileName: file.name,
        filePath,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        description,
        isActive: true,
      },
    });

    return NextResponse.json({ file: downloadableFile }, { status: 201 });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
