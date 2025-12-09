"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const user = useUser();
  const [userData, setUserData] = useState<{ companyId: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch(() => setUserData(null));
    }
  }, [user]);

  const handlePricingClick = (plan: string) => {
    if (!user) {
      router.push("/handler/sign-up");
      return;
    }

    // If user is part of a company, go to checkout
    if (userData?.companyId) {
      router.push("/purchase");
    } else {
      // Otherwise go to buy-tokens page
      router.push("/dashboard/buy-tokens");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">TokenShopSimulator</h1>
          </div>
          <div className="space-x-3">
            <Link href="/handler/sign-in">
              <Button variant="ghost" className="hover:bg-slate-100">Connexion</Button>
            </Link>
            <Link href="/handler/sign-up">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25">S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="inline-block mb-6">
          <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
            Plateforme de gestion de tokens
          </span>
        </div>
        <h2 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-teal-700 bg-clip-text text-transparent mb-6 leading-tight">
          Gestion de Tokens de<br />Transcription Simplifiée
        </h2>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Achetez des tokens de transcription pour vos livestreams et vidéos.
          Payez à l&apos;utilisation ou choisissez un forfait adapté à vos besoins.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/handler/sign-up">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 px-8">
              Commencer maintenant
            </Button>
          </Link>
          <Link href="/handler/sign-in">

          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <Package className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-slate-800">Forfaits Flexibles</CardTitle>
              <CardDescription className="text-slate-600">
                Choisissez entre le paiement à l&apos;utilisation ou des forfaits avantageux
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-slate-800">Paiement Sécurisé</CardTitle>
              <CardDescription className="text-slate-600">
                Transactions sécurisées et gestion simplifiée de vos achats
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-slate-800">Gestion d&apos;Équipe</CardTitle>
              <CardDescription className="text-slate-600">
                Gérez les utilisateurs et les rôles au sein de votre entreprise
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-slate-800">Suivi en Temps Réel</CardTitle>
              <CardDescription className="text-slate-600">
                Suivez votre consommation et votre solde de tokens en direct
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">Nos Forfaits</h3>
          <p className="text-slate-600 text-lg">Choisissez le plan qui correspond à vos besoins</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Starter</CardTitle>
              <CardDescription className="text-slate-600">Parfait pour commencer</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">0.05$</span>
                <span className="text-slate-600 text-lg">/token</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Aucun engagement</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Payez uniquement ce que vous utilisez</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Support par email</span>
                </li>
              </ul>
              <Button onClick={() => handlePricingClick("starter")} className="w-full mt-8 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900">
                Choisir Starter
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative ring-2 ring-blue-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                ⭐ Plus populaire
              </span>
            </div>
            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-2xl mb-2">Pro</CardTitle>
              <CardDescription className="text-slate-600">Pour les petites équipes</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">49$</span>
                <span className="text-slate-600 text-lg">/mois</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>1500 tokens inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Économie de 20%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Support prioritaire</span>
                </li>
              </ul>
              <Button onClick={() => handlePricingClick("pro")} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                Choisir Pro
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Business</CardTitle>
              <CardDescription className="text-slate-600">Pour les grandes entreprises</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900">199$</span>
                <span className="text-slate-600 text-lg">/mois</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>7500 tokens inclus</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Économie de 30%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Support dédié 24/7</span>
                </li>
              </ul>
              <Button onClick={() => handlePricingClick("business")} className="w-full mt-8 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900">
                Choisir Business
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 TokenShopSimulator. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

