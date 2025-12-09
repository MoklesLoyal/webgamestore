import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { packageId, companyId } = await req.json();

    // Get package details
    const packageData = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageData) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: packageData.name,
              description: packageData.description || `${packageData.tokensAmount} tokens de transcription`,
            },
            unit_amount: Math.round(packageData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transactions?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/packages?canceled=true`,
      metadata: {
        packageId: packageData.id,
        companyId: company.id,
        tokensAmount: packageData.tokensAmount.toString(),
      },
      customer_email: company.email,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
