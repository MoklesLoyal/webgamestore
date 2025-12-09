"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code, Search, Lock, Unlock, Play, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  adminOnly?: boolean;
  requestBody?: Record<string, any>;
  responseExample?: Record<string, any>;
  queryParams?: Array<{ name: string; type: string; description: string; required?: boolean }>;
};

const apiEndpoints: Record<string, ApiEndpoint[]> = {
  auth: [
    {
      method: "POST",
      path: "/api/auth/sync",
      description: "Synchronise l'utilisateur avec Stack Auth et crée/met à jour l'utilisateur dans la base de données",
      auth: true,
      adminOnly: false,
      responseExample: {
        id: "user_id",
        email: "user@example.com",
        name: "John Doe",
        role: "USER",
        company: {
          id: "company_id",
          name: "Company Name",
          tokenBalance: 50000
        }
      }
    }
  ],
  companies: [
    {
      method: "GET",
      path: "/api/companies",
      description: "Récupère la liste de toutes les entreprises",
      auth: true,
      adminOnly: true,
      responseExample: [
        {
          id: "company_id",
          name: "Company Name",
          email: "contact@company.com",
          phone: "+1234567890",
          address: "123 Street",
          tokenBalance: 50000,
          users: [],
          _count: { transactions: 10 }
        }
      ]
    },
    {
      method: "POST",
      path: "/api/companies",
      description: "Crée une nouvelle entreprise",
      auth: true,
      adminOnly: true,
      requestBody: {
        name: "Company Name",
        email: "contact@company.com",
        phone: "+1234567890",
        address: "123 Street"
      },
      responseExample: {
        id: "company_id",
        name: "Company Name",
        email: "contact@company.com",
        tokenBalance: 50000
      }
    },
    {
      method: "GET",
      path: "/api/companies/:id",
      description: "Récupère les détails d'une entreprise spécifique",
      auth: true,
      adminOnly: true,
      responseExample: {
        id: "company_id",
        name: "Company Name",
        email: "contact@company.com",
        tokenBalance: 50000
      }
    },
    {
      method: "PATCH",
      path: "/api/companies/:id",
      description: "Met à jour les informations d'une entreprise",
      auth: true,
      adminOnly: true,
      requestBody: {
        name: "Updated Company Name",
        email: "newemail@company.com",
        phone: "+1234567890",
        address: "New Address"
      }
    },
    {
      method: "DELETE",
      path: "/api/companies/:id",
      description: "Supprime une entreprise",
      auth: true,
      adminOnly: true
    },
    {
      method: "POST",
      path: "/api/companies/:id/tokens",
      description: "Ajoute ou retire des tokens du solde d'une entreprise",
      auth: true,
      adminOnly: true,
      requestBody: {
        amount: 1000,
        reason: "Ajout manuel par administrateur"
      },
      responseExample: {
        id: "company_id",
        tokenBalance: 51000,
        transaction: {
          id: "transaction_id",
          tokensAmount: 1000,
          type: "PURCHASE"
        }
      }
    }
  ],
  users: [
    {
      method: "GET",
      path: "/api/users",
      description: "Récupère la liste de tous les utilisateurs",
      auth: true,
      adminOnly: true,
      responseExample: [
        {
          id: "user_id",
          email: "user@example.com",
          name: "John Doe",
          role: "USER",
          companyId: "company_id",
          isActive: true,
          company: {
            id: "company_id",
            name: "Company Name"
          }
        }
      ]
    },
    {
      method: "POST",
      path: "/api/users",
      description: "Crée un nouvel utilisateur",
      auth: true,
      adminOnly: true,
      requestBody: {
        email: "newuser@example.com",
        name: "Jane Doe",
        role: "USER",
        companyId: "company_id"
      }
    },
    {
      method: "GET",
      path: "/api/users/:id",
      description: "Récupère les détails d'un utilisateur spécifique",
      auth: true,
      adminOnly: true
    },
    {
      method: "PATCH",
      path: "/api/users/:id",
      description: "Met à jour les informations d'un utilisateur",
      auth: true,
      adminOnly: true,
      requestBody: {
        name: "Updated Name",
        role: "COMPANY",
        companyId: "company_id",
        isActive: true
      }
    },
    {
      method: "DELETE",
      path: "/api/users/:id",
      description: "Supprime un utilisateur",
      auth: true,
      adminOnly: true
    }
  ],
  packages: [
    {
      method: "GET",
      path: "/api/packages",
      description: "Récupère la liste de tous les forfaits",
      auth: true,
      queryParams: [
        { name: "active", type: "boolean", description: "Filtre les forfaits actifs uniquement", required: false }
      ],
      responseExample: [
        {
          id: "package_id",
          name: "Starter Pack",
          description: "Pack de démarrage",
          type: "TOKEN_PACK",
          tokensAmount: 1000,
          price: 49.99,
          isActive: true,
          features: ["Feature 1", "Feature 2"]
        }
      ]
    },
    {
      method: "POST",
      path: "/api/packages",
      description: "Crée un nouveau forfait",
      auth: true,
      adminOnly: true,
      requestBody: {
        name: "New Package",
        description: "Package description",
        type: "TOKEN_PACK",
        tokensAmount: 1000,
        price: 49.99,
        isActive: true,
        features: ["Feature 1", "Feature 2"]
      }
    },
    {
      method: "GET",
      path: "/api/packages/:id",
      description: "Récupère les détails d'un forfait spécifique",
      auth: true
    },
    {
      method: "PATCH",
      path: "/api/packages/:id",
      description: "Met à jour un forfait",
      auth: true,
      adminOnly: true,
      requestBody: {
        name: "Updated Package",
        price: 59.99,
        isActive: false
      }
    },
    {
      method: "DELETE",
      path: "/api/packages/:id",
      description: "Supprime un forfait",
      auth: true,
      adminOnly: true
    }
  ],
  transactions: [
    {
      method: "GET",
      path: "/api/transactions",
      description: "Récupère la liste des transactions",
      auth: true,
      queryParams: [
        { name: "companyId", type: "string", description: "Filtre par ID d'entreprise", required: false }
      ],
      responseExample: [
        {
          id: "transaction_id",
          companyId: "company_id",
          packageId: "package_id",
          type: "PURCHASE",
          status: "COMPLETED",
          amount: 49.99,
          tokensAmount: 1000,
          description: "Achat de tokens",
          createdAt: "2025-12-09T10:00:00Z",
          company: {
            name: "Company Name"
          },
          package: {
            name: "Starter Pack"
          }
        }
      ]
    },
    {
      method: "POST",
      path: "/api/transactions",
      description: "Crée une nouvelle transaction",
      auth: true,
      adminOnly: true,
      requestBody: {
        companyId: "company_id",
        packageId: "package_id",
        type: "PURCHASE",
        status: "COMPLETED",
        amount: 49.99,
        tokensAmount: 1000,
        description: "Achat de tokens"
      }
    },
    {
      method: "GET",
      path: "/api/transactions/:id",
      description: "Récupère les détails d'une transaction spécifique",
      auth: true
    },
    {
      method: "PATCH",
      path: "/api/transactions/:id",
      description: "Met à jour une transaction",
      auth: true,
      adminOnly: true,
      requestBody: {
        status: "COMPLETED",
        description: "Updated description"
      }
    },
    {
      method: "DELETE",
      path: "/api/transactions/:id",
      description: "Supprime une transaction",
      auth: true,
      adminOnly: true
    }
  ],
  enterpriseRequests: [
    {
      method: "GET",
      path: "/api/enterprise-requests",
      description: "Récupère la liste des demandes d'entreprise (utilisateur voit ses demandes, admin voit tout)",
      auth: true,
      responseExample: [
        {
          id: "request_id",
          userId: "user_id",
          type: "CREATE_COMPANY",
          status: "PENDING",
          companyName: "New Company",
          companyEmail: "contact@newcompany.com",
          message: "Requesting company creation",
          adminResponse: null,
          createdAt: "2025-12-09T10:00:00Z"
        }
      ]
    },
    {
      method: "POST",
      path: "/api/enterprise-requests",
      description: "Crée une nouvelle demande d'entreprise",
      auth: true,
      requestBody: {
        type: "CREATE_COMPANY",
        companyName: "New Company",
        companyEmail: "contact@newcompany.com",
        companyPhone: "+1234567890",
        companyAddress: "123 Street",
        message: "I would like to create a company"
      }
    },
    {
      method: "PATCH",
      path: "/api/enterprise-requests/:id",
      description: "Approuve ou rejette une demande d'entreprise (admin uniquement)",
      auth: true,
      adminOnly: true,
      requestBody: {
        status: "APPROVED",
        adminResponse: "Request approved"
      }
    },
    {
      method: "DELETE",
      path: "/api/enterprise-requests/:id",
      description: "Supprime une demande d'entreprise",
      auth: true
    }
  ],
  stripe: [
    {
      method: "POST",
      path: "/api/checkout",
      description: "Crée une session de paiement Stripe Checkout",
      auth: true,
      requestBody: {
        packageId: "package_id"
      },
      responseExample: {
        url: "https://checkout.stripe.com/..."
      }
    },
    {
      method: "POST",
      path: "/api/verify-payment",
      description: "Vérifie et traite un paiement Stripe après le checkout",
      auth: true,
      requestBody: {
        sessionId: "stripe_session_id"
      },
      responseExample: {
        success: true,
        transaction: {
          id: "transaction_id",
          status: "COMPLETED"
        },
        previousBalance: 50000,
        newBalance: 51000
      }
    },
    {
      method: "POST",
      path: "/api/webhooks/stripe",
      description: "Webhook Stripe pour traiter les événements de paiement automatiquement",
      auth: false,
      requestBody: {
        type: "checkout.session.completed",
        data: {}
      }
    }
  ]
};

export default function ApiDocsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("auth");
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);
  const [requestBody, setRequestBody] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<{ status: number; data: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await fetch("/api/auth/sync", { method: "POST" });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== "ADMIN") {
          router.replace("/dashboard/profile");
          return;
        }
      } else {
        router.replace("/handler/sign-in");
        return;
      }
    } catch (error) {
      console.error("Error checking access:", error);
      router.replace("/handler/sign-in");
      return;
    } finally {
      setIsCheckingAccess(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  const handleTest = async (endpoint: ApiEndpoint) => {
    setIsLoading(true);
    setResponse(null);

    try {
      let url = endpoint.path;
      
      // Replace :id with actual value if provided in request body
      if (url.includes(":id") && requestBody["id"]) {
        url = url.replace(":id", requestBody["id"]);
      }

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.method !== "GET" && endpoint.method !== "DELETE") {
        options.body = JSON.stringify(requestBody);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setResponse({
        status: res.status,
        data,
      });

      toast(res.ok ? "Succès" : "Erreur", {
        description: res.ok ? "Requête exécutée avec succès" : `Erreur ${res.status}`,
      });
    } catch (error) {
      setResponse({
        status: 500,
        data: { error: error instanceof Error ? error.message : "Erreur inconnue" },
      });
      
      toast("Erreur", {
        description: "Impossible d'exécuter la requête",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
    
    toast("Copié!", {
      description: "Le chemin a été copié dans le presse-papier",
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500";
      case "POST":
        return "bg-green-500";
      case "PUT":
      case "PATCH":
        return "bg-yellow-500";
      case "DELETE":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filterEndpoints = (endpoints: ApiEndpoint[]) => {
    if (!searchQuery) return endpoints;
    return endpoints.filter(
      (endpoint) =>
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const allFilteredEndpoints = Object.entries(apiEndpoints).reduce((acc, [category, endpoints]) => {
    const filtered = filterEndpoints(endpoints);
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Code className="w-8 h-8" />
          Documentation API
        </h2>
        <p className="text-muted-foreground mt-2">
          Liste complète de tous les endpoints API disponibles dans l'application
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un endpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="companies">Entreprises</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="packages">Forfaits</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="enterpriseRequests">Demandes</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
        </TabsList>

        {Object.entries(allFilteredEndpoints).map(([category, endpoints]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getMethodColor(endpoint.method)} text-white`}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        {endpoint.auth && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Auth requis
                          </Badge>
                        )}
                        {endpoint.adminOnly && (
                          <Badge variant="destructive">Admin uniquement</Badge>
                        )}
                      </div>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                      >
                        {copiedPath === endpoint.path ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          if (testingEndpoint === endpoint.path) {
                            setTestingEndpoint(null);
                            setResponse(null);
                            setRequestBody({});
                          } else {
                            setTestingEndpoint(endpoint.path);
                            setResponse(null);
                            setRequestBody(endpoint.requestBody || {});
                          }
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {testingEndpoint === endpoint.path ? "Fermer" : "Tester"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Paramètres de requête</h4>
                      <div className="space-y-2">
                        {endpoint.queryParams.map((param, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {param.name}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && (
                              <Badge variant="destructive" className="text-xs">
                                Requis
                              </Badge>
                            )}
                            <span className="text-muted-foreground">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {endpoint.requestBody && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Corps de la requête</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  {endpoint.responseExample && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Exemple de réponse</h4>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{JSON.stringify(endpoint.responseExample, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  {testingEndpoint === endpoint.path && (
                    <div className="border-t pt-4 mt-4 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Play className="w-4 h-4" />
                        <h4 className="font-semibold text-sm">Test en direct</h4>
                      </div>

                      {(endpoint.method !== "GET" && endpoint.method !== "DELETE") && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Corps de la requête (JSON)
                          </label>
                          <Textarea
                            value={JSON.stringify(requestBody, null, 2)}
                            onChange={(e) => {
                              try {
                                setRequestBody(JSON.parse(e.target.value));
                              } catch {
                                // Ignore invalid JSON while typing
                              }
                            }}
                            placeholder='{"key": "value"}'
                            className="font-mono text-xs min-h-[150px]"
                          />
                        </div>
                      )}

                      {endpoint.path.includes(":id") && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            ID (remplace :id dans l'URL)
                          </label>
                          <Input
                            value={requestBody["id"] || ""}
                            onChange={(e) =>
                              setRequestBody({ ...requestBody, id: e.target.value })
                            }
                            placeholder="Entrez l'ID"
                          />
                        </div>
                      )}

                      <Button
                        onClick={() => handleTest(endpoint)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? "Exécution..." : "Exécuter la requête"}
                      </Button>

                      {response && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={response.status < 400 ? "default" : "destructive"}
                            >
                              Status: {response.status}
                            </Badge>
                          </div>
                          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{JSON.stringify(response.data, null, 2)}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {endpoints.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Aucun endpoint ne correspond à votre recherche dans cette catégorie
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
