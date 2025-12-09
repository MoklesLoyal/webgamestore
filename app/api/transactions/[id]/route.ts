import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTransactionSchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/transactions/[id] - Get a specific transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        package: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la transaction' },
      { status: 500 }
    )
  }
}

// PATCH /api/transactions/[id] - Update a transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      )
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        company: true,
        package: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error: any) {
    console.error('Error updating transaction:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la transaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction non trouvée' },
        { status: 404 }
      )
    }

    // Only allow deletion of pending or failed transactions
    if (existingTransaction.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une transaction complétée' },
        { status: 400 }
      )
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Transaction supprimée avec succès' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la transaction' },
      { status: 500 }
    )
  }
}
