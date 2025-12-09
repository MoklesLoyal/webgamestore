import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying payment for session:", sessionId);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("💳 Session status:", session.payment_status);
    console.log("📊 Session metadata:", session.metadata);

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed", status: session.payment_status },
        { status: 400 }
      );
    }

    const { transactionId, companyId, tokensAmount } = session.metadata || {};

    if (!transactionId || !companyId || !tokensAmount) {
      return NextResponse.json(
        { error: "Missing metadata in session" },
        { status: 400 }
      );
    }

    // Check if transaction is already completed
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (existingTransaction.status === "COMPLETED") {
      return NextResponse.json({
        message: "Payment already processed",
        alreadyProcessed: true,
      });
    }

    console.log("💰 Processing payment...");

    // Get company before update
    const companyBefore = await prisma.company.findUnique({
      where: { id: companyId },
      select: { tokenBalance: true, name: true },
    });

    // Update transaction and company balance in a transaction
    await prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "COMPLETED",
          metadata: {
            ...(existingTransaction.metadata as any),
            stripeSessionId: session.id,
            stripePaymentIntent: session.payment_intent,
            verifiedAt: new Date().toISOString(),
          },
        },
      });

      // Add tokens to company balance
      await tx.company.update({
        where: { id: companyId },
        data: {
          tokenBalance: {
            increment: parseInt(tokensAmount),
          },
        },
      });
    });

    // Get updated company
    const companyAfter = await prisma.company.findUnique({
      where: { id: companyId },
      select: { tokenBalance: true, name: true },
    });

    console.log(`✅ Payment verified and processed`);
    console.log(`🏢 Company: ${companyBefore?.name}`);
    console.log(`💰 Balance: ${companyBefore?.tokenBalance} -> ${companyAfter?.tokenBalance}`);
    console.log(`➕ Added: ${tokensAmount} tokens`);

    return NextResponse.json({
      message: "Payment verified and processed successfully",
      transaction: {
        id: transactionId,
        tokensAdded: parseInt(tokensAmount),
        previousBalance: companyBefore?.tokenBalance,
        newBalance: companyAfter?.tokenBalance,
      },
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
