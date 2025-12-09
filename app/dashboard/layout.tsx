"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, CreditCard, LogOut, User, ShoppingCart, Coins, Building2, Users, Receipt } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUserRole() {
      if (user === null) {
        router.replace("/handler/sign-in");
        return;
      }

      if (!user) return;

      try {
        // Sync user with database
        const response = await fetch("/api/auth/sync", {
          method: "POST",
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAdmin(userData.role === "ADMIN");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user !== undefined) {
      checkUserRole();
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await user.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">WebGameStore</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.primaryEmail}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link href="/dashboard/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Mon Profil
              </Button>
            </Link>
            <Link href="/dashboard/buy-tokens">
              <Button variant="ghost" className="w-full justify-start">
                <Coins className="w-4 h-4 mr-2" />
                Acheter des Tokens
              </Button>
            </Link>
            <Link href="/dashboard/my-transactions">
              <Button variant="ghost" className="w-full justify-start">
                <CreditCard className="w-4 h-4 mr-2" />
                Mes Transactions
              </Button>
            </Link>

            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase px-3">
                    Administration
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Tableau de bord
                  </Button>
                </Link>
                <Link href="/dashboard/companies">
                  <Button variant="ghost" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-2" />
                    Entreprises
                  </Button>
                </Link>
                <Link href="/dashboard/users">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Utilisateurs
                  </Button>
                </Link>
                <Link href="/dashboard/packages">
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Forfaits
                  </Button>
                </Link>
                <Link href="/dashboard/transactions">
                  <Button variant="ghost" className="w-full justify-start">
                    <Receipt className="w-4 h-4 mr-2" />
                    Transactions
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
