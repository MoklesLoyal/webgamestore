import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTransactionSchema } from '@/lib/validations'
import { stackServerApp } from '@/lib/stack'

// GET /api/transactions - List all transactions
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: any = {}
    if (companyId) where.companyId = companyId
    if (type) where.type = type
    if (status) where.status = status

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des transactions' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create a new transaction (purchase tokens)
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
    const validatedData = createTransactionSchema.parse(body)

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: validatedData.companyId },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    // Verify package exists if provided
    if (validatedData.packageId) {
      const packageData = await prisma.package.findUnique({
        where: { id: validatedData.packageId },
      })

      if (!packageData) {
        return NextResponse.json(
          { error: 'Forfait non trouvé' },
          { status: 404 }
        )
      }

      if (!packageData.isActive) {
        return NextResponse.json(
          { error: 'Ce forfait n\'est plus actif' },
          { status: 400 }
        )
      }
    }

    // Create transaction and update company balance in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const transaction = await tx.transaction.create({
        data: {
          ...validatedData,
          status: 'COMPLETED',
        },
        include: {
          company: true,
          package: true,
        },
      })

      // Update company token balance based on transaction type
      let balanceChange = 0
      if (validatedData.type === 'PURCHASE') {
        balanceChange = validatedData.tokensAmount
      } else if (validatedData.type === 'USAGE') {
        balanceChange = -validatedData.tokensAmount
      } else if (validatedData.type === 'REFUND') {
        balanceChange = validatedData.tokensAmount
      }

      const updatedCompany = await tx.company.update({
        where: { id: validatedData.companyId },
        data: {
          tokenBalance: {
            increment: balanceChange,
          },
        },
      })

      // Ensure balance doesn't go negative
      if (updatedCompany.tokenBalance < 0) {
        throw new Error('Solde de tokens insuffisant')
      }

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transaction:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    if (error.message === 'Solde de tokens insuffisant') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création de la transaction' },
      { status: 500 }
    )
  }
}
