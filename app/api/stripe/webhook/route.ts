import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract metadata
    const packageId = session.metadata?.packageId;
    const companyId = session.metadata?.companyId;
    const tokensAmount = parseInt(session.metadata?.tokensAmount || "0");

    if (packageId && companyId && tokensAmount) {
      try {
        // Get package details
        const packageData = await prisma.package.findUnique({
          where: { id: packageId },
        });

        if (!packageData) {
          console.error("Package not found:", packageId);
          return NextResponse.json({ error: "Package not found" }, { status: 404 });
        }

        // Create transaction and update company balance
        await prisma.$transaction(async (tx: any) => {
          // Create transaction
          await tx.transaction.create({
            data: {
              companyId,
              packageId,
              type: "PURCHASE",
              amount: packageData.price,
              tokensAmount,
              status: "COMPLETED",
              description: `Achat via Stripe: ${packageData.name}`,
              metadata: {
                stripeSessionId: session.id,
                stripePaymentIntent: session.payment_intent,
              },
            },
          });

          // Update company token balance
          await tx.company.update({
            where: { id: companyId },
            data: {
              tokenBalance: {
                increment: tokensAmount,
              },
            },
          });
        });

        console.log("Payment processed successfully:", session.id);
      } catch (error) {
        console.error("Error processing payment:", error);
        return NextResponse.json(
          { error: "Failed to process payment" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
