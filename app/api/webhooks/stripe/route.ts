import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.payment_status === "paid") {
          const { transactionId, companyId, tokensAmount } = session.metadata || {};

          if (!transactionId || !companyId || !tokensAmount) {
            console.error("Missing metadata in checkout session");
            break;
          }

          // Update transaction status
          await prisma.transaction.update({
            where: { id: transactionId },
            data: {
              status: "COMPLETED",
              metadata: {
                ...(typeof session.metadata === 'object' ? session.metadata : {}),
                stripeSessionId: session.id,
                stripePaymentIntent: session.payment_intent,
              },
            },
          });

          // Add tokens to company balance
          await prisma.company.update({
            where: { id: companyId },
            data: {
              tokenBalance: {
                increment: parseInt(tokensAmount),
              },
            },
          });

          console.log(`Successfully added ${tokensAmount} tokens to company ${companyId}`);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { transactionId } = session.metadata || {};

        if (transactionId) {
          await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: "CANCELLED" },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find transaction by payment intent
        const transaction = await prisma.transaction.findFirst({
          where: {
            metadata: {
              path: ["stripePaymentIntent"],
              equals: paymentIntent.id,
            },
          },
        });

        if (transaction) {
          await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
