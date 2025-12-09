import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stackServerApp } from '@/lib/stack'

// POST /api/companies/[id]/tokens - Add or remove tokens from a company
export async function POST(
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
    const { amount, reason } = body

    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json(
        { error: 'Le montant doit être un nombre non nul' },
        { status: 400 }
      )
    }

    const company = await prisma.company.findUnique({
      where: { id },
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      )
    }

    const newBalance = company.tokenBalance + amount

    if (newBalance < 0) {
      return NextResponse.json(
        { error: 'Solde insuffisant. Le solde ne peut pas être négatif.' },
        { status: 400 }
      )
    }

    // Update company token balance and create transaction record
    const [updatedCompany, transaction] = await prisma.$transaction([
      prisma.company.update({
        where: { id },
        data: { tokenBalance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          companyId: id,
          type: amount > 0 ? 'PURCHASE' : 'REFUND',
          status: 'COMPLETED',
          amount: Math.abs(amount) * 0.01, // Symbolic amount
          tokensAmount: Math.abs(amount),
          description: reason || `${amount > 0 ? 'Ajout' : 'Retrait'} manuel par administrateur`,
          metadata: {
            adminAction: true,
            previousBalance: company.tokenBalance,
            newBalance: newBalance,
          }
        },
      }),
    ])

    console.log(`✅ Admin added ${amount} tokens to company ${company.name}. New balance: ${newBalance}`)

    return NextResponse.json({
      company: updatedCompany,
      transaction,
      message: `${amount > 0 ? 'Ajout' : 'Retrait'} de ${Math.abs(amount)} tokens effectué avec succès`,
    })
  } catch (error) {
    console.error('Error managing tokens:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la gestion des tokens' },
      { status: 500 }
    )
  }
}
