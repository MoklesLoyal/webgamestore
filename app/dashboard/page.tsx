"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, CreditCard, TrendingUp } from "lucide-react";

interface Stats {
  totalCompanies: number;
  totalPackages: number;
  totalTransactions: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    totalPackages: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        // Sync and check user role
        const syncResponse = await fetch("/api/auth/sync", {
          method: "POST",
        });

        if (!mounted) return;

        if (!syncResponse.ok) {
          router.replace("/handler/sign-in");
          return;
        }

        const userData = await syncResponse.json();

        // Redirect non-admin users to profile
        if (userData.role !== "ADMIN") {
          router.replace("/dashboard/profile");
          return;
        }

        if (!mounted) return;

        setIsAdmin(true);

        // Load admin stats
        const [companies, packages, transactions] = await Promise.all([
          fetch("/api/companies").then(r => r.json()),
          fetch("/api/packages").then(r => r.json()),
          fetch("/api/transactions").then(r => r.json()),
        ]);

        if (!mounted) return;

        const revenue = transactions
          .filter((t: any) => t.status === "COMPLETED" && t.type === "PURCHASE")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        setStats({
          totalCompanies: companies.length,
          totalPackages: packages.length,
          totalTransactions: transactions.length,
          totalRevenue: revenue,
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre plateforme de gestion de tokens
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entreprises
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Entreprises inscrites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Forfaits
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPackages}</div>
            <p className="text-xs text-muted-foreground">
              Forfaits disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Transactions totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}$</div>
            <p className="text-xs text-muted-foreground">
              Revenus totaux
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur TokenShopSimulator</CardTitle>
          <CardDescription>
            Gérez vos entreprises, forfaits et transactions depuis ce tableau de bord
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Cette plateforme vous permet de gérer efficacement votre système de tokens de transcription.
            Utilisez le menu de gauche pour naviguer entre les différentes sections.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Gestion des entreprises</h3>
              <p className="text-sm text-gray-600">
                Créez et gérez les entreprises clientes, suivez leur solde de tokens
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Forfaits flexibles</h3>
              <p className="text-sm text-gray-600">
                Proposez des forfaits à l&apos;utilisation ou des packages prédéfinis
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Suivi des transactions</h3>
              <p className="text-sm text-gray-600">
                Visualisez toutes les transactions d&apos;achat, d&apos;utilisation et de remboursement
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Gestion des utilisateurs</h3>
              <p className="text-sm text-gray-600">
                Administrez les rôles et permissions des utilisateurs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
