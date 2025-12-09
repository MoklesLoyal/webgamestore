"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, CreditCard, Coins, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error("Stripe publishable key is missing. Please check your .env file.");
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface Package {
  id: string;
  name: string;
  description: string | null;
  type: string;
  tokensAmount: number;
  price: number;
  features: string[];
  isActive: boolean;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  companyId: string | null;
  company?: {
    id: string;
    name: string;
    tokenBalance: number;
  } | null;
}

export default function BuyTokensPage() {
  const user = useUser();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<Package[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Verify Stripe configuration on mount
    if (!stripePublishableKey) {
      console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
      setMessage({
        type: "error",
        text: "Configuration Stripe manquante. Veuillez vérifier les variables d'environnement."
      });
    } else {
      console.log("✅ Stripe key loaded:", stripePublishableKey.substring(0, 20) + "...");
    }

    fetchData();

    // Check for success/cancel params from Stripe redirect
    const success = searchParams?.get("success");
    const canceled = searchParams?.get("canceled");

    if (success === "true") {
      setMessage({ 
        type: "success", 
        text: "Paiement réussi ! Vos tokens ont été ajoutés à votre compte." 
      });
      // Clear the URL params
      window.history.replaceState({}, "", "/dashboard/buy-tokens");
    } else if (canceled === "true") {
      setMessage({ 
        type: "error", 
        text: "Paiement annulé. Aucun montant n'a été débité." 
      });
      // Clear the URL params
      window.history.replaceState({}, "", "/dashboard/buy-tokens");
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [packagesRes, userRes] = await Promise.all([
        fetch("/api/packages?active=true"),
        fetch("/api/auth/sync", { method: "POST" }),
      ]);

      if (packagesRes.ok) {
        const data = await packagesRes.json();
        // Filter only PACKAGE type (not PAY_PER_USE)
        setPackages(data.filter((pkg: Package) => pkg.type === "PACKAGE"));
      }

      if (userRes.ok) {
        const data = await userRes.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement des données" });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    console.log("🛒 Purchase initiated for package:", packageId);
    console.log("👤 User data:", userData);
    console.log("🔑 Stripe key available:", !!stripePublishableKey);
    
    if (!userData?.companyId) {
      console.error("❌ No company ID found");
      setMessage({ 
        type: "error", 
        text: "Vous devez être associé à une entreprise pour acheter des tokens" 
      });
      return;
    }

    setPurchasing(packageId);
    setMessage(null);

    try {
      console.log("📡 Sending checkout request...");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          companyId: userData.companyId,
        }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ Checkout error:", error);
        throw new Error(error.error || "Erreur lors de la création de la session de paiement");
      }

      const { url } = await response.json();
      console.log("✅ Checkout URL received:", url);

      if (!url) {
        console.error("❌ No checkout URL received");
        throw new Error("URL de paiement non reçue");
      }
      
      // Redirect to Stripe Checkout
      console.log("💳 Redirecting to Stripe checkout...");
      window.location.href = url;
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur lors de l'achat",
      });
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Acheter des Tokens</h1>
          <p className="text-gray-600 mt-2">
            Choisissez un forfait de tokens pour votre entreprise
          </p>
        </div>
        {userData?.company && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Solde actuel</p>
                  <p className="text-2xl font-bold">{userData.company.tokenBalance} tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!userData?.companyId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être associé à une entreprise pour acheter des tokens. 
            Veuillez contacter un administrateur.
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.filter(pkg => pkg.type === "PACKAGE").map((pkg) => {
          const isPopular = pkg.name.toLowerCase().includes("pro") || pkg.tokensAmount >= 1000;
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative ${isPopular ? "border-2 border-blue-500 shadow-lg" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Populaire</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold">{pkg.price}$</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {pkg.tokensAmount} tokens
                  </p>
                  <p className="text-xs text-gray-500">
                    ({(pkg.price / pkg.tokensAmount).toFixed(3)}$ par token)
                  </p>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={!userData?.companyId || purchasing === pkg.id}
                  className="w-full"
                  size="lg"
                >
                  {purchasing === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Acheter maintenant
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {packages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Aucun forfait disponible pour le moment</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Informations importantes</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Les tokens sont crédités instantanément après le paiement</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Les tokens sont partagés avec tous les membres de votre entreprise</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Paiement sécurisé via Stripe</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Les tokens n&apos;expirent pas</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
