import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/notes - List all learning notes
export async function GET() {
  try {
    const notes = await prisma.learningNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Gagal mengambil catatan" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a learning note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, topic, status } = body;

    if (!title || !content || !topic) {
      return NextResponse.json(
        { error: "Judul, konten, dan topik wajib diisi" },
        { status: 400 }
      );
    }

    const note = await prisma.learningNote.create({
      data: {
        title: String(title),
        content: String(content),
        topic: String(topic),
        status: status || "in-progress",
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan catatan" },
      { status: 500 }
    );
  }
}

// PATCH /api/notes?id=xxx - Update note status
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    const note = await prisma.learningNote.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
        ...(body.topic && { topic: body.topic }),
        ...(body.status && { status: body.status }),
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui catatan" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    await prisma.learningNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Gagal menghapus catatan" },
      { status: 500 }
    );
  }
}
