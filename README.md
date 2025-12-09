# WebGameStore - Plateforme de Gestion de Tokens de Transcription

Une application web moderne pour la gestion de tokens de transcription pour livestreams et vidéos, avec support du paiement à l'utilisation et des forfaits.

## 🚀 Fonctionnalités

### Entités Principales
- **Entreprises (Companies)** : Gestion des entreprises clientes avec suivi du solde de tokens
- **Forfaits (Packages)** : Gestion des forfaits (paiement à l'usage ou packages prédéfinis)
- **Transactions** : Suivi complet des achats, utilisations et remboursements
- **Utilisateurs (Users)** : Gestion des utilisateurs avec rôles et permissions

### CRUD Complet
- ✅ Création, lecture, mise à jour et suppression pour toutes les entités
- ✅ Validation côté client et serveur avec Zod
- ✅ Messages d'erreur et de succès pertinents
- ✅ Interface responsive avec Tailwind CSS et shadcn/ui

### Authentification et Sécurité
- ✅ Authentification avec Stack Auth
- ✅ Gestion des rôles (ADMIN, COMPANY, USER)
- ✅ Sessions persistantes avec gestion automatique de l'inactivité
- ✅ Routes protégées par authentification

### Architecture Technique
- ✅ Backend en JavaScript avec Next.js App Router
- ✅ API REST avec validation des données
- ✅ Frontend en React.js avec Next.js
- ✅ Prisma ORM connecté à une base de données Neon (PostgreSQL)
- ✅ UI moderne avec Tailwind CSS et shadcn/ui

## 📋 Prérequis

- Node.js 18+ et npm
- Un compte [Neon](https://neon.tech/) pour la base de données PostgreSQL
- Un compte [Stack Auth](https://stack-auth.com/) pour l'authentification

## 🛠️ Installation

### 1. Cloner le projet
```bash
cd webgamestore
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de l'environnement

Copiez le fichier `.env.example` vers `.env` et configurez les variables :

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech/database?sslmode=require"

# Stack Auth (https://stack-auth.com/)
NEXT_PUBLIC_STACK_PROJECT_ID="your_stack_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_stack_publishable_key"
STACK_SECRET_SERVER_KEY="your_stack_secret_key"

# Stripe (https://stripe.com/)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

#### Configuration de Neon Database
1. Créez un compte sur [Neon](https://neon.tech/)
2. Créez un nouveau projet
3. Copiez la chaîne de connexion et remplacez `DATABASE_URL` dans `.env`

#### Configuration de Stack Auth
1. Créez un compte sur [Stack Auth](https://stack-auth.com/)
2. Créez un nouveau projet
3. Copiez les clés d'API et mettez-les dans `.env`
4. Configurez les URLs de redirection dans Stack Auth :
   - Sign In URL: `http://localhost:3000/sign-in`
   - After Sign In: `http://localhost:3000/dashboard`
   - After Sign Out: `http://localhost:3000`

#### Configuration de Stripe
1. Créez un compte sur [Stripe](https://stripe.com/)
2. Récupérez vos clés de test (commençant par `pk_test_` et `sk_test_`)
3. Configurez un webhook pointant vers : `http://localhost:3000/api/webhooks/stripe`
4. Sélectionnez les événements suivants dans le webhook :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copiez le secret du webhook (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`

**Tester les webhooks en local avec Stripe CLI :**
```bash
# Installer Stripe CLI : https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. Configuration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
webgamestore/
├── app/
│   ├── api/                    # API Routes REST
│   │   ├── checkout/          # Stripe Checkout
│   │   ├── companies/         # CRUD Entreprises + Tokens Management
│   │   ├── packages/          # CRUD Forfaits
│   │   ├── transactions/      # CRUD Transactions
│   │   ├── users/             # CRUD Utilisateurs
│   │   └── webhooks/stripe/   # Webhooks Stripe
│   ├── dashboard/             # Pages du tableau de bord
│   │   ├── buy-tokens/        # Page d'achat de tokens avec Stripe
│   │   ├── companies/         # Gestion entreprises
│   │   ├── packages/          # Gestion forfaits
│   │   ├── transactions/      # Gestion transactions
│   │   └── users/             # Gestion utilisateurs
│   ├── layout.tsx             # Layout principal avec Stack Auth
│   └── page.tsx               # Page d'accueil
├── components/
│   ├── providers/             # Providers React (Stack Auth)
│   └── ui/                    # Composants shadcn/ui
├── lib/
│   ├── prisma.ts             # Client Prisma
│   ├── stack.ts              # Configuration Stack Auth
│   ├── stripe.ts             # Client Stripe
│   └── validations.ts        # Schémas de validation Zod
├── prisma/
│   └── schema.prisma         # Schéma de base de données
└── package.json
```

## 🎯 Fonctionnalités Conformes aux Exigences

### ✅ Deux Entités Principales Reliées
- **Company** ↔ **Transaction** (une entreprise a plusieurs transactions)
- **Package** ↔ **Transaction** (un forfait peut être utilisé dans plusieurs transactions)
- **User** ↔ **Company** (utilisateurs appartiennent à une entreprise)

### ✅ Intégration Stripe pour les paiements
- Page d'achat de tokens (`/dashboard/buy-tokens`)
- Checkout sécurisé avec Stripe
- Webhooks pour la confirmation des paiements
- Historique des transactions de paiement

### ✅ CRUD Complet
Toutes les entités principales disposent d'un CRUD complet :
- **CREATE** : Formulaires de création avec validation
- **READ** : Listes paginées et vues détaillées
- **UPDATE** : Formulaires de modification
- **DELETE** : Suppression avec confirmation

### ✅ Interface Clara, Fluide et Responsive
- Design moderne avec Tailwind CSS
- Composants réactifs shadcn/ui
- Responsive sur mobile, tablette et desktop
- Navigation intuitive

### ✅ Validation des Données
- **Côté Client** : React Hook Form + Zod
- **Côté Serveur** : Validation API avec Zod
- Messages d'erreur clairs et contextuels

### ✅ Messages d'Erreur et de Succès
- Alerts contextuels pour chaque action
- Messages d'erreur détaillés
- Notifications de succès
- Gestion des erreurs réseau

### ✅ Composants Réactifs et Modernes
- React Hooks (useState, useEffect, useForm)
- Context avec Stack Auth Provider
- Composants fonctionnels modernes
- TypeScript pour la sécurité des types

## 📊 Modèle de Données

### Company (Entreprise)
```typescript
{
  id: string
  name: string
  email: string (unique)
  phone?: string
  address?: string
  tokenBalance: number
  users: User[]
  transactions: Transaction[]
}
```

### Package (Forfait)
```typescript
{
  id: string
  name: string
  description?: string
  type: "PAY_PER_USE" | "PACKAGE"
  tokensAmount: number
  price: number
  isActive: boolean
  features: string[]
  transactions: Transaction[]
}
```

### Transaction
```typescript
{
  id: string
  companyId: string
  packageId?: string
  type: "PURCHASE" | "USAGE" | "REFUND"
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED"
  amount: number
  tokensAmount: number
  description?: string
  metadata?: JSON
}
```

### User (Utilisateur)
```typescript
{
  id: string
  email: string (unique)
  name?: string
  role: "ADMIN" | "COMPANY" | "USER"
  stackAuthId?: string
  companyId?: string
  isActive: boolean
  lastActiveAt: DateTime
}
```

## 🔐 Rôles et Permissions

- **ADMIN** : Accès complet à toutes les fonctionnalités
- **COMPANY** : Gestion de son entreprise et de ses utilisateurs
- **USER** : Consultation et utilisation des tokens

## 📝 Scripts Disponibles

```bash
npm run dev          # Lancer en développement
npm run build        # Build pour production
npm run start        # Lancer en production
npm run lint         # Vérifier le code
npx prisma studio    # Ouvrir Prisma Studio
npx prisma generate  # Générer le client Prisma
npx prisma db push   # Pousser le schéma vers la DB
```

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez que toutes les variables d'environnement sont correctement configurées
2. Assurez-vous que la base de données Neon est accessible
3. Vérifiez les logs dans la console pour plus de détails

## 📄 Licence

Ce projet est créé à des fins éducatives.

---

Développé avec ❤️ en utilisant Next.js, React, TypeScript, Prisma, Stack Auth et Tailwind CSS

