"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, Users, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WebGameStore</h1>
          <div className="space-x-4">
            <Link href="/handler/sign-in">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/handler/sign-up">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Gestion de Tokens de Transcription
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Achetez des tokens de transcription pour vos livestreams et vidéos.
          Payez à l&apos;utilisation ou choisissez un forfait adapté à vos besoins.
        </p>
        <div className="space-x-4">
          <Link href="/handler/sign-up">
            <Button size="lg">Commencer maintenant</Button>
          </Link>
          <Link href="/purchase">
            <Button size="lg" variant="outline">Acheter des tokens</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Package className="w-12 h-12 text-blue-600 mb-2" />
              <CardTitle>Forfaits Flexibles</CardTitle>
              <CardDescription>
                Choisissez entre le paiement à l&apos;utilisation ou des forfaits avantageux
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="w-12 h-12 text-green-600 mb-2" />
              <CardTitle>Paiement Sécurisé</CardTitle>
              <CardDescription>
                Transactions sécurisées et gestion simplifiée de vos achats
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-purple-600 mb-2" />
              <CardTitle>Gestion d&apos;Équipe</CardTitle>
              <CardDescription>
                Gérez les utilisateurs et les rôles au sein de votre entreprise
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-orange-600 mb-2" />
              <CardTitle>Suivi en Temps Réel</CardTitle>
              <CardDescription>
                Suivez votre consommation et votre solde de tokens en direct
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Nos Forfaits</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Paiement à l&apos;usage</CardTitle>
              <CardDescription>Parfait pour commencer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">0.05$<span className="text-lg font-normal">/token</span></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Aucun engagement</li>
                <li>✓ Payez uniquement ce que vous utilisez</li>
                <li>✓ Support par email</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-600 border-2">
            <CardHeader>
              <CardTitle>Forfait Starter</CardTitle>
              <CardDescription>Pour les petites équipes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">49$<span className="text-lg font-normal">/mois</span></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 1500 tokens inclus</li>
                <li>✓ Économie de 20%</li>
                <li>✓ Support prioritaire</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forfait Business</CardTitle>
              <CardDescription>Pour les grandes entreprises</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-4">199$<span className="text-lg font-normal">/mois</span></div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ 7500 tokens inclus</li>
                <li>✓ Économie de 30%</li>
                <li>✓ Support dédié 24/7</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 WebGameStore. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

