import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPackageSchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/packages - List all packages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const packages = await prisma.package.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
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

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des forfaits' },
      { status: 500 }
    )
  }
}

// POST /api/packages - Create a new package
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
    const validatedData = createPackageSchema.parse(body)

    const packageData = await prisma.package.create({
      data: validatedData,
    })

    return NextResponse.json(packageData, { status: 201 })
  } catch (error: any) {
    console.error('Error creating package:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du forfait' },
      { status: 500 }
    )
  }
}
