"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Loader2, CreditCard } from "lucide-react";

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

interface Company {
  id: string;
  name: string;
  email: string;
}

export default function PurchasePackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesRes, companiesRes] = await Promise.all([
        fetch("/api/packages?active=true"),
        fetch("/api/companies"),
      ]);

      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data);
      }

      if (companiesRes.ok) {
        const data = await companiesRes.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement des données" });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!selectedCompany) {
      setMessage({ type: "error", text: "Veuillez sélectionner une entreprise" });
      return;
    }

    setPurchasing(packageId);
    setMessage(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          companyId: selectedCompany,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session de paiement");
      }

      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Acheter des Tokens</h1>
        <p className="text-gray-600">Choisissez un forfait et procédez au paiement sécurisé</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}`}>
          <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionnez votre entreprise
        </label>
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Choisir une entreprise --</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="mt-2">{pkg.description}</CardDescription>
                </div>
                {pkg.type === "PACKAGE" && (
                  <Badge variant="default" className="ml-2">Forfait</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {pkg.price}$
                </div>
                <div className="text-sm text-gray-600">
                  {pkg.tokensAmount.toLocaleString()} tokens
                </div>
              </div>

              {pkg.features && pkg.features.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                onClick={() => handlePurchase(pkg.id)}
                disabled={!selectedCompany || purchasing === pkg.id}
                className="w-full"
              >
                {purchasing === pkg.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Acheter maintenant
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun forfait disponible pour le moment</p>
        </div>
      )}
    </div>
  );
}
