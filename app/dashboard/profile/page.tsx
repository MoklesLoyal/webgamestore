"use client";

import { useEffect, useState } from "react";
import { useUser } from "@stackframe/stack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CreditCard, Coins } from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  company: {
    id: string;
    name: string;
    tokenBalance: number;
  } | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  tokensAmount: number;
  status: string;
  description: string | null;
  createdAt: string;
  package: {
    name: string;
  } | null;
}

export default function ProfilePage() {
  const stackUser = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function syncAndLoadUser() {
      if (!stackUser) {
        if (mounted && stackUser === null) {
          setLoading(false);
        }
        return;
      }

      try {
        // Sync user with database
        const syncResponse = await fetch("/api/auth/sync", {
          method: "POST",
        });

        if (!mounted) return;

        if (!syncResponse.ok) {
          throw new Error("Failed to sync user");
        }

        const dbUser = await syncResponse.json();
        
        if (!mounted) return;
        
        setUserData(dbUser);

        // Load user's transactions if they have a company
        if (dbUser.company) {
          const transactionsResponse = await fetch(`/api/transactions?companyId=${dbUser.company.id}`);
          if (transactionsResponse.ok && mounted) {
            const transactionsData = await transactionsResponse.json();
            setTransactions(transactionsData);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (stackUser !== undefined) {
      syncAndLoadUser();
    }

    return () => {
      mounted = false;
    };
  }, [stackUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement du profil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mon Profil</h2>
        <p className="text-muted-foreground">
          Gérez votre compte et consultez vos transactions
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-semibold">Nom: </span>
            <span>{userData.name || "Non défini"}</span>
          </div>
          <div>
            <span className="font-semibold">Email: </span>
            <span>{userData.email}</span>
          </div>
          <div>
            <span className="font-semibold">Rôle: </span>
            <span className="capitalize">{userData.role.toLowerCase()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      {userData.company ? (
        <Card>
          <CardHeader>
            <CardTitle>Mon Entreprise</CardTitle>
            <CardDescription>Informations de votre entreprise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold">Nom: </span>
              <span>{userData.company.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Solde de tokens: </span>
              <span className="text-2xl font-bold text-blue-600">
                {userData.company.tokenBalance.toLocaleString()}
              </span>
            </div>
            <Link href="/purchase">
              <Button className="w-full">
                <Package className="w-4 h-4 mr-2" />
                Acheter des tokens
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucune entreprise</CardTitle>
            <CardDescription>Vous n&apos;êtes pas encore associé à une entreprise</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Contactez un administrateur pour être ajouté à une entreprise et commencer à acheter des tokens.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
          <CardDescription>Historique de vos achats et utilisations</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune transaction pour le moment
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {transaction.description || transaction.package?.name || "Transaction"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.type === "PURCHASE" ? "+" : "-"}
                      {transaction.tokensAmount} tokens
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.amount.toFixed(2)} $
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        transaction.status === "COMPLETED"
                          ? "text-green-600"
                          : transaction.status === "PENDING"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
