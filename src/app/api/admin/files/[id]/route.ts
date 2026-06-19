import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import { resolveStoredFilePath } from "@/lib/uploads";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const file = await prisma.downloadableFile.update({
      where: { id },
      data: {
        isActive: body.isActive,
        description: body.description,
      },
    });

    return NextResponse.json({ file });
  } catch (error) {
    console.error("File update error:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await prisma.downloadableFile.findUnique({ where: { id } });

    if (file) {
      try {
        const fullPath = resolveStoredFilePath(file.filePath);
        await unlink(fullPath);
      } catch {
        // File may already be deleted from disk
      }
      await prisma.downloadableFile.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File delete error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
