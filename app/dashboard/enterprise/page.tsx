"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, UserPlus, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  companyId: string | null;
  company?: {
    id: string;
    name: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  email: string;
}

interface EnterpriseRequest {
  id: string;
  type: string;
  status: string;
  companyName?: string;
  companyEmail?: string;
  targetCompany?: {
    name: string;
  };
  message?: string;
  adminResponse?: string;
  createdAt: string;
  processedAt?: string;
}

export default function EnterprisePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requests, setRequests] = useState<EnterpriseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    message: "",
  });

  const [joinForm, setJoinForm] = useState({
    targetCompanyId: "",
    message: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, companiesRes, requestsRes] = await Promise.all([
        fetch("/api/auth/sync", { method: "POST" }),
        fetch("/api/companies"),
        fetch("/api/enterprise-requests"),
      ]);

      if (userRes.ok) {
        const user = await userRes.json();
        setUserData(user);
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement des données" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/enterprise-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CREATE_COMPANY",
          ...createForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Demande de création envoyée avec succès !" });
        setCreateDialogOpen(false);
        setCreateForm({
          companyName: "",
          companyEmail: "",
          companyPhone: "",
          companyAddress: "",
          message: "",
        });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'envoi de la demande" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'envoi de la demande" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/enterprise-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "JOIN_COMPANY",
          ...joinForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Demande d'adhésion envoyée avec succès !" });
        setJoinDialogOpen(false);
        setJoinForm({
          targetCompanyId: "",
          message: "",
        });
        fetchData();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'envoi de la demande" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de l'envoi de la demande" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approuvée</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" /> Rejetée</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion Entreprise</h2>
        <p className="text-muted-foreground">
          Créez une nouvelle entreprise ou rejoignez une entreprise existante
        </p>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>Statut actuel</CardTitle>
          <CardDescription>Votre affiliation d'entreprise</CardDescription>
        </CardHeader>
        <CardContent>
          {userData?.company ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">{userData.company.name}</p>
                <p className="text-sm text-green-700">Vous êtes membre de cette entreprise</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-slate-700">Vous n'êtes pas encore affilié à une entreprise</p>
              <p className="text-sm text-slate-500 mt-1">
                Créez votre entreprise ou rejoignez une entreprise existante pour commencer
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {!userData?.company && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Créer une entreprise
              </CardTitle>
              <CardDescription>
                Créez votre propre entreprise et invitez des membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Demander la création
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Créer une entreprise</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations de votre entreprise
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRequest} className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                      <Input
                        id="companyName"
                        required
                        value={createForm.companyName}
                        onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                        placeholder="Abdel hamid Wares"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">Email de l'entreprise *</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        required
                        value={createForm.companyEmail}
                        onChange={(e) => setCreateForm({ ...createForm, companyEmail: e.target.value })}
                        placeholder="Abdelhamid@wares.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone">Téléphone</Label>
                      <Input
                        id="companyPhone"
                        value={createForm.companyPhone}
                        onChange={(e) => setCreateForm({ ...createForm, companyPhone: e.target.value })}
                        placeholder="(000)123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyAddress">Adresse</Label>
                      <Input
                        id="companyAddress"
                        value={createForm.companyAddress}
                        onChange={(e) => setCreateForm({ ...createForm, companyAddress: e.target.value })}
                        placeholder="Khajit Street"
                      />
                    </div>
                    <div>
                      <Label htmlFor="createMessage">Message pour l'administrateur</Label>
                      <Input
                        id="createMessage"
                        value={createForm.message}
                        onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                        placeholder="Raison de la demande..."
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer la demande"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Rejoindre une entreprise
              </CardTitle>
              <CardDescription>
                Demandez à rejoindre une entreprise existante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Demander l'adhésion
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Rejoindre une entreprise</DialogTitle>
                    <DialogDescription>
                      Sélectionnez l'entreprise que vous souhaitez rejoindre
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleJoinRequest} className="space-y-4">
                    <div>
                      <Label htmlFor="targetCompany">Entreprise *</Label>
                      <Select
                        required
                        value={joinForm.targetCompanyId}
                        onValueChange={(value) => setJoinForm({ ...joinForm, targetCompanyId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="joinMessage">Message pour l'administrateur</Label>
                      <Input
                        id="joinMessage"
                        value={joinForm.message}
                        onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                        placeholder="Pourquoi voulez-vous rejoindre..."
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer la demande"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Mes demandes</CardTitle>
          <CardDescription>Historique de vos demandes d'entreprise</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune demande pour le moment
            </p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {request.type === "CREATE_COMPANY" ? (
                        <Building2 className="w-5 h-5 text-blue-600" />
                      ) : (
                        <UserPlus className="w-5 h-5 text-teal-600" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {request.type === "CREATE_COMPANY"
                            ? `Création: ${request.companyName}`
                            : `Adhésion: ${request.targetCompany?.name}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.message && (
                    <p className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3">
                      <strong>Votre message:</strong> {request.message}
                    </p>
                  )}
                  {request.adminResponse && (
                    <p className="text-sm text-slate-600 border-l-2 border-blue-500 pl-3 bg-blue-50 p-2 rounded">
                      <strong>Réponse admin:</strong> {request.adminResponse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
