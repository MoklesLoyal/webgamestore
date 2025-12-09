import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/lib/stack";

// GET /api/enterprise-requests - Get user's requests or all requests (admin)
export async function GET(request: NextRequest) {
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

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // If admin, get all requests, otherwise get only user's requests
    const where = dbUser.role === "ADMIN" ? {} : { userId: dbUser.id };

    const requests = await prisma.enterpriseRequest.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching enterprise requests:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes" },
      { status: 500 }
    );
  }
}

// POST /api/enterprise-requests - Create a new request
export async function POST(request: NextRequest) {
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

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Check if user already has a company
    if (dbUser.companyId) {
      return NextResponse.json(
        { error: "Vous êtes déjà affilié à une entreprise" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, companyName, companyEmail, companyPhone, companyAddress, targetCompanyId, message } = body;

    if (!type || !["CREATE_COMPANY", "JOIN_COMPANY"].includes(type)) {
      return NextResponse.json(
        { error: "Type de demande invalide" },
        { status: 400 }
      );
    }

    // Check if user already has a pending request of this type
    const existingRequest = await prisma.enterpriseRequest.findFirst({
      where: {
        userId: dbUser.id,
        type: type,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Vous avez déjà une demande en attente de ce type" },
        { status: 400 }
      );
    }

    // Validate required fields based on type
    if (type === "CREATE_COMPANY") {
      if (!companyName || !companyEmail) {
        return NextResponse.json(
          { error: "Nom et email de l'entreprise requis" },
          { status: 400 }
        );
      }

      // Check if company email already exists
      const existingCompany = await prisma.company.findUnique({
        where: { email: companyEmail },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: "Une entreprise avec cet email existe déjà" },
          { status: 400 }
        );
      }
    } else if (type === "JOIN_COMPANY") {
      if (!targetCompanyId) {
        return NextResponse.json(
          { error: "Entreprise cible requise" },
          { status: 400 }
        );
      }

      // Verify target company exists
      const targetCompany = await prisma.company.findUnique({
        where: { id: targetCompanyId },
      });

      if (!targetCompany) {
        return NextResponse.json(
          { error: "Entreprise cible introuvable" },
          { status: 404 }
        );
      }
    }

    // Create the request
    const enterpriseRequest = await prisma.enterpriseRequest.create({
      data: {
        userId: dbUser.id,
        type,
        status: "PENDING",
        companyName: type === "CREATE_COMPANY" ? companyName : undefined,
        companyEmail: type === "CREATE_COMPANY" ? companyEmail : undefined,
        companyPhone: type === "CREATE_COMPANY" ? companyPhone : undefined,
        companyAddress: type === "CREATE_COMPANY" ? companyAddress : undefined,
        targetCompanyId: type === "JOIN_COMPANY" ? targetCompanyId : undefined,
        message,
      },
      include: {
        targetCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(enterpriseRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating enterprise request:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    );
  }
}
