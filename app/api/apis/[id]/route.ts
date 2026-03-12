import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/auth";
import { updateApiSchema } from "@/lib/validations";
import { cookies } from "next/headers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const apiId = parseInt(id);
    if (isNaN(apiId)) {
      return NextResponse.json(
        { error: "Invalid API ID" },
        { status: 400 }
      );
    }

    const api = await prisma.aPI.findUnique({
      where: { id: apiId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!api) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this API
    if (user.role !== "Admin" && api.userId !== user.userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ api });
  } catch (error) {
    console.error("Get API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const apiId = parseInt(id);
    if (isNaN(apiId)) {
      return NextResponse.json(
        { error: "Invalid API ID" },
        { status: 400 }
      );
    }

    const existingApi = await prisma.aPI.findUnique({
      where: { id: apiId },
    });

    if (!existingApi) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this API
    if (user.role !== "Admin" && existingApi.userId !== user.userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateApiSchema.parse(body);

    const api = await prisma.aPI.update({
      where: { id: parseInt(id) },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ api });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Update API error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error("Update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const apiId = parseInt(id);
    if (isNaN(apiId)) {
      return NextResponse.json(
        { error: "Invalid API ID" },
        { status: 400 }
      );
    }

    const existingApi = await prisma.aPI.findUnique({
      where: { id: apiId },
    });

    if (!existingApi) {
      return NextResponse.json(
        { error: "API not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this API
    if (user.role !== "Admin" && existingApi.userId !== user.userId) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    await prisma.aPI.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "API deleted successfully" });
  } catch (error) {
    console.error("Delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
