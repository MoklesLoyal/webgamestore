import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCompanySchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/companies/[id] - Get a specific company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          }
        },
        transactions: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            package: true,
          }
        },
        _count: {
          select: {
            transactions: true,
            users: true,
          }
        }
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'entreprise' },
      { status: 500 }
    )
  }
}

// PATCH /api/companies/[id] - Update a company
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateCompanySchema.parse(body)

    const existingCompany = await prisma.company.findUnique({
      where: { id },
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    if (validatedData.email && validatedData.email !== existingCompany.email) {
      const emailExists = await prisma.company.findUnique({
        where: { email: validatedData.email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Une entreprise avec cet email existe déjà' },
          { status: 400 }
        )
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: validatedData,
      include: {
        users: true,
      },
    })

    return NextResponse.json(company)
  } catch (error: any) {
    console.error('Error updating company:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'entreprise' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id] - Delete a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id },
    })

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Entreprise supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'entreprise' },
      { status: 500 }
    )
  }
}
