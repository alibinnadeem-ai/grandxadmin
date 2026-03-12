import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "User",
        isApproved: false,
      },
      select: {
        id: true,
        username: true,
        role: true,
        isApproved: true,
      },
    });

    return NextResponse.json(
      {
        user,
        message: "Registration successful. Please wait for admin approval.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("Register error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
