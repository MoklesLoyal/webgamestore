import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const adminUser = await stackServerApp.getUser();
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    if (validatedData.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      })

      if (!company) {
        return NextResponse.json(
          { error: 'Entreprise non trouvée' },
          { status: 404 }
        )
      }
    }

    const user = await prisma.user.create({
      data: validatedData,
      include: {
        company: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}
