import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updatePackageSchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/packages/[id] - Get a specific package
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const packageData = await prisma.package.findUnique({
      where: { id },
      include: {
        transactions: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            transactions: true,
          }
        }
      },
    })

    if (!packageData) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du forfait' },
      { status: 500 }
    )
  }
}

// PATCH /api/packages/[id] - Update a package
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
    const validatedData = updatePackageSchema.parse(body)

    const existingPackage = await prisma.package.findUnique({
      where: { id },
    })

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      )
    }

    const packageData = await prisma.package.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(packageData)
  } catch (error: any) {
    console.error('Error updating package:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du forfait' },
      { status: 500 }
    )
  }
}

// DELETE /api/packages/[id] - Delete a package
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

    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
          }
        }
      }
    })

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Forfait non trouvé' },
        { status: 404 }
      )
    }

    if (existingPackage._count.transactions > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un forfait avec des transactions associées' },
        { status: 400 }
      )
    }

    await prisma.package.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Forfait supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du forfait' },
      { status: 500 }
    )
  }
}
