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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">TokenShopSimulator</h1>
              <p className="text-xs text-slate-500">Token Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user.primaryEmail}</p>
              <p className="text-xs text-slate-500">{isAdmin ? "Administrateur" : "Utilisateur"}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white/50 backdrop-blur-sm border-r border-slate-200/60 min-h-[calc(100vh-73px)] shadow-sm">
          <nav className="p-4 space-y-1">
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase px-3 mb-2">
                Personnel
              </p>
              <Link href="/dashboard/profile">
                <Button variant="ghost" className="w-full justify-start hover:bg-blue-50/50 hover:text-blue-700 transition-all">
                  <User className="w-4 h-4 mr-3" />
                  Mon Profil
                </Button>
              </Link>
              <Link href="/dashboard/buy-tokens">
                <Button variant="ghost" className="w-full justify-start hover:bg-teal-50/50 hover:text-teal-700 transition-all">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Acheter des Tokens
                </Button>
              </Link>
              <Link href="/dashboard/enterprise">
                <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50/50 hover:text-indigo-700 transition-all">
                  <Building2 className="w-4 h-4 mr-3" />
                  Mon Entreprise
                </Button>
              </Link>
              <Link href="/dashboard/my-transactions">
                <Button variant="ghost" className="w-full justify-start hover:bg-purple-50/50 hover:text-purple-700 transition-all">
                  <CreditCard className="w-4 h-4 mr-3" />
                  Mes Transactions
                </Button>
              </Link>
            </div>

            {isAdmin && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase px-3 mb-2">
                  Administration
                </p>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 hover:text-slate-900 transition-all">
                    <LayoutDashboard className="w-4 h-4 mr-3" />
                    Tableau de bord
                  </Button>
                </Link>
                <Link href="/dashboard/companies">
                  <Button variant="ghost" className="w-full justify-start hover:bg-indigo-50/50 hover:text-indigo-700 transition-all">
                    <Building2 className="w-4 h-4 mr-3" />
                    Entreprises
                  </Button>
                </Link>
                <Link href="/dashboard/enterprise-requests">
                  <Button variant="ghost" className="w-full justify-start hover:bg-purple-50/50 hover:text-purple-700 transition-all">
                    <Users className="w-4 h-4 mr-3" />
                    Demandes Entreprise
                  </Button>
                </Link>
                <Link href="/dashboard/users">
                  <Button variant="ghost" className="w-full justify-start hover:bg-blue-50/50 hover:text-blue-700 transition-all">
                    <Users className="w-4 h-4 mr-3" />
                    Utilisateurs
                  </Button>
                </Link>
                <Link href="/dashboard/packages">
                  <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50/50 hover:text-emerald-700 transition-all">
                    <Package className="w-4 h-4 mr-3" />
                    Forfaits
                  </Button>
                </Link>
                <Link href="/dashboard/transactions">
                  <Button variant="ghost" className="w-full justify-start hover:bg-amber-50/50 hover:text-amber-700 transition-all">
                    <Receipt className="w-4 h-4 mr-3" />
                    Transactions
                  </Button>
                </Link>
              </div>
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
