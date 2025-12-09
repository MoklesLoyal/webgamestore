import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  try {
    const { packageId, companyId } = await req.json();
    
    console.log("🛒 Checkout request received:", { packageId, companyId });

    if (!packageId || !companyId) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Package ID and Company ID are required" },
        { status: 400 }
      );
    }

    // Get package details
    const packageData = await prisma.package.findUnique({
      where: { id: packageId },
    });

    console.log("📦 Package data:", packageData);

    if (!packageData || !packageData.isActive) {
      console.error("❌ Package not found or inactive");
      return NextResponse.json(
        { error: "Package not found or inactive" },
        { status: 404 }
      );
    }

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    console.log("🏢 Company data:", company);

    if (!company) {
      console.error("❌ Company not found");
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        companyId: companyId,
        packageId: packageId,
        type: "PURCHASE",
        status: "PENDING",
        amount: packageData.price,
        tokensAmount: packageData.tokensAmount,
        description: `Purchase of ${packageData.name}`,
        metadata: {
          packageName: packageData.name,
          packageType: packageData.type,
        },
      },
    });

    console.log("💾 Transaction created:", transaction.id);

    // Create Stripe checkout session
    console.log("💳 Creating Stripe session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: packageData.name,
              description: packageData.description || `${packageData.tokensAmount} tokens`,
            },
            unit_amount: Math.round(packageData.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/buy-tokens?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/buy-tokens?canceled=true`,
      metadata: {
        transactionId: transaction.id,
        companyId: companyId,
        packageId: packageId,
        tokensAmount: packageData.tokensAmount.toString(),
      },
      customer_email: company.email,
    });

    console.log("✅ Stripe session created:", session.id);
    console.log("🔗 Checkout URL:", session.url);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error("❌ Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
