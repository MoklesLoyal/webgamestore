"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, CreditCard, Coins, AlertCircle } from "lucide-react";

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
    fetchData();

    // Check for success/cancel params from Stripe redirect
    const success = searchParams?.get("success");
    const canceled = searchParams?.get("canceled");
    const sessionId = searchParams?.get("session_id");

    if (success === "true" && sessionId) {
      // Verify and complete the payment
      verifyPayment(sessionId);
    } else if (canceled === "true") {
      setMessage({ 
        type: "error", 
        text: "Paiement annulé. Aucun montant n'a été débité." 
      });
      // Clear the URL params
      window.history.replaceState({}, "", "/dashboard/buy-tokens");
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: data.alreadyProcessed 
            ? "Paiement déjà traité. Vos tokens sont disponibles."
            : `Paiement réussi ! ${data.transaction?.tokensAdded || 0} tokens ajoutés à votre compte.` 
        });
        // Refresh data to show updated balance
        fetchData();
      } else {
        setMessage({ 
          type: "error", 
          text: "Erreur lors de la vérification du paiement. Contactez le support si le problème persiste." 
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setMessage({ 
        type: "error", 
        text: "Erreur lors de la vérification du paiement." 
      });
    } finally {
      // Clear the URL params
      window.history.replaceState({}, "", "/dashboard/buy-tokens");
    }
  };

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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Acheter des Tokens</h1>
          <p className="text-slate-600 mt-2">
            Choisissez un forfait de tokens pour votre entreprise
          </p>
        </div>
        {userData?.company && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Solde actuel</p>
                  <p className="text-2xl font-bold text-slate-900">{userData.company.tokenBalance.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">tokens disponibles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!userData?.companyId && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Vous devez être associé à une entreprise pour acheter des tokens. 
            Veuillez contacter un administrateur.
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"} className="shadow-lg">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.filter(pkg => pkg.type === "PACKAGE").map((pkg) => {
          const isPopular = pkg.name.toLowerCase().includes("pro") || pkg.tokensAmount >= 1000;
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 ${
                isPopular 
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-500" 
                  : "bg-white"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg px-4">
                    ⭐ Populaire
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-slate-900">{pkg.name}</CardTitle>
                <CardDescription className="text-slate-600">{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{pkg.price}$</span>
                  </div>
                  <div className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-2">
                    <p className="text-lg font-semibold">
                      {pkg.tokensAmount.toLocaleString()} tokens
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {(pkg.price / pkg.tokensAmount).toFixed(3)}$ par token
                  </p>
                </div>

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={!userData?.companyId || purchasing === pkg.id}
                  className={`w-full shadow-lg ${
                    isPopular
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900"
                  }`}
                  size="lg"
                >
                  {purchasing === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement en cours...
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
        <Card className="border-0 shadow-xl">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Aucun forfait disponible pour le moment</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-xl mb-4 text-slate-900">💎 Informations importantes</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <span>Les tokens sont crédités <strong>instantanément</strong> après le paiement</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <span>Les tokens sont partagés avec <strong>tous les membres</strong> de votre entreprise</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <span>Paiement <strong>100% sécurisé</strong> via Stripe</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-blue-600" />
              </div>
              <span>Les tokens <strong>n&apos;expirent jamais</strong></span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
