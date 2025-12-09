import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/lib/stack";

// PATCH /api/enterprise-requests/[id] - Approve or reject a request (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status, adminResponse } = body;

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    // Get the request
    const enterpriseRequest = await prisma.enterpriseRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!enterpriseRequest) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    if (enterpriseRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette demande a déjà été traitée" },
        { status: 400 }
      );
    }

    // If approved, create company or add user to company
    if (status === "APPROVED") {
      if (enterpriseRequest.type === "CREATE_COMPANY") {
        // Create the company
        const company = await prisma.company.create({
          data: {
            name: enterpriseRequest.companyName!,
            email: enterpriseRequest.companyEmail!,
            phone: enterpriseRequest.companyPhone,
            address: enterpriseRequest.companyAddress,
            tokenBalance: 50000, // Initial balance
          },
        });

        // Assign user to company
        await prisma.user.update({
          where: { id: enterpriseRequest.userId },
          data: {
            companyId: company.id,
            role: "COMPANY", // Upgrade to company role
          },
        });
      } else if (enterpriseRequest.type === "JOIN_COMPANY") {
        // Add user to company
        await prisma.user.update({
          where: { id: enterpriseRequest.userId },
          data: {
            companyId: enterpriseRequest.targetCompanyId!,
          },
        });
      }
    }

    // Update request status
    const updatedRequest = await prisma.enterpriseRequest.update({
      where: { id },
      data: {
        status,
        adminResponse,
        processedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        targetCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error processing enterprise request:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}

// DELETE /api/enterprise-requests/[id] - Delete a request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackAuthId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    const { id } = params;

    const enterpriseRequest = await prisma.enterpriseRequest.findUnique({
      where: { id },
    });

    if (!enterpriseRequest) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    // Only allow deletion by request owner or admin
    if (enterpriseRequest.userId !== dbUser.id && dbUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    await prisma.enterpriseRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Demande supprimée" });
  } catch (error) {
    console.error("Error deleting enterprise request:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la demande" },
      { status: 500 }
    );
  }
}
