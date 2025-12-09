"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, UserPlus, Loader2, CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EnterpriseRequest {
  id: string;
  type: string;
  status: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  targetCompany?: {
    id: string;
    name: string;
  };
  message?: string;
  adminResponse?: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  createdAt: string;
  processedAt?: string;
}

export default function EnterpriseRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<EnterpriseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<EnterpriseRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">("APPROVED");

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
        fetchRequests();
      } else {
        router.replace("/handler/sign-in");
      }
    } catch (error) {
      console.error("Error checking access:", error);
      router.replace("/handler/sign-in");
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/enterprise-requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setMessage({ type: "error", text: "Erreur lors du chargement des demandes" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (request: EnterpriseRequest, action: "APPROVED" | "REJECTED") => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminResponse("");
    setDialogOpen(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(selectedRequest.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/enterprise-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType,
          adminResponse: adminResponse || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Demande ${actionType === "APPROVED" ? "approuvée" : "rejetée"} avec succès`,
        });
        setDialogOpen(false);
        fetchRequests();
      } else {
        setMessage({ type: "error", text: data.error || "Erreur lors du traitement" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du traitement de la demande" });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" /> En attente
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Approuvée
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500">
            <XCircle className="w-3 h-3 mr-1" /> Rejetée
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

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
        <h2 className="text-3xl font-bold tracking-tight">Demandes Entreprise</h2>
        <p className="text-muted-foreground">
          Gérez les demandes de création et d'adhésion aux entreprises
        </p>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Traitées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{processedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes en attente</CardTitle>
          <CardDescription>Requiert votre attention</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune demande en attente
            </p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-6 border rounded-lg space-y-4 bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {request.type === "CREATE_COMPANY" ? (
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                      ) : (
                        <div className="p-3 bg-teal-100 rounded-lg">
                          <UserPlus className="w-6 h-6 text-teal-600" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.type === "CREATE_COMPANY"
                              ? `Création: ${request.companyName}`
                              : `Adhésion: ${request.targetCompany?.name}`}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Demandé par: {request.user.name || request.user.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(request.createdAt).toLocaleString("fr-FR")}
                          </p>
                        </div>

                        {request.type === "CREATE_COMPANY" && (
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Mail className="w-4 h-4" />
                              <span>{request.companyEmail}</span>
                            </div>
                            {request.companyPhone && (
                              <div className="flex items-center gap-2 text-slate-700">
                                <Phone className="w-4 h-4" />
                                <span>{request.companyPhone}</span>
                              </div>
                            )}
                            {request.companyAddress && (
                              <div className="flex items-center gap-2 text-slate-700">
                                <MapPin className="w-4 h-4" />
                                <span>{request.companyAddress}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {request.message && (
                          <div className="p-3 bg-white border border-slate-200 rounded-lg">
                            <p className="text-sm text-slate-700">
                              <strong>Message:</strong> {request.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenDialog(request, "APPROVED")}
                      disabled={processing === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => handleOpenDialog(request, "REJECTED")}
                      disabled={processing === request.id}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes traitées</CardTitle>
          <CardDescription>Historique des demandes approuvées et rejetées</CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune demande traitée
            </p>
          ) : (
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                        <p className="text-sm text-slate-600">
                          {request.user.name || request.user.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          Traité le {new Date(request.processedAt!).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.adminResponse && (
                    <div className="p-2 bg-blue-50 border-l-2 border-blue-500 rounded text-sm">
                      <strong>Réponse admin:</strong> {request.adminResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVED" ? "Approuver la demande" : "Rejeter la demande"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVED"
                ? "Cette action créera l'entreprise ou ajoutera l'utilisateur à l'entreprise."
                : "L'utilisateur recevra une notification de rejet."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="adminResponse">Message pour l'utilisateur (optionnel)</Label>
              <Input
                id="adminResponse"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Ajouter un message..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={!!processing}>
                Annuler
              </Button>
              <Button
                onClick={handleProcessRequest}
                disabled={!!processing}
                className={actionType === "APPROVED" ? "bg-green-600 hover:bg-green-700" : ""}
                variant={actionType === "REJECTED" ? "destructive" : "default"}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    {actionType === "APPROVED" ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Confirmer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
