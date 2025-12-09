import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser();
    
    if (!stackUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { stackAuthId: stackUser.id },
      include: { company: true },
    });

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: stackUser.primaryEmail || "",
        name: stackUser.displayName || stackUser.primaryEmail || "User",
        stackAuthId: stackUser.id,
        role: "USER",
      },
      include: { company: true },
    });

    return NextResponse.json(newUser);
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync user" },
      { status: 500 }
    );
  }
}
