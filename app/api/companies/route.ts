import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCompanySchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/companies - List all companies
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          }
        },
        _count: {
          select: {
            transactions: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des entreprises' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createCompanySchema.parse(body)

    const existingCompany = await prisma.company.findUnique({
      where: { email: validatedData.email },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Une entreprise avec cet email existe déjà' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: validatedData,
      include: {
        users: true,
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'entreprise' },
      { status: 500 }
    )
  }
}
