# Token Purchase Feature Setup

## Overview
Users can now purchase tokens directly from their dashboard. The feature integrates with Stripe for secure payment processing.

## Features
- ✅ Token purchase page at `/dashboard/buy-tokens`
- ✅ View current token balance
- ✅ Browse available token packages
- ✅ Secure Stripe Checkout integration
- ✅ Automatic token crediting after successful payment
- ✅ Transaction history tracking

## Setup Instructions

### 1. Stripe Configuration

#### Get Your Stripe API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Update your `.env` file with these keys

#### Set Up Webhook
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
   - For local testing with Stripe CLI: `http://localhost:3000/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Update `STRIPE_WEBHOOK_SECRET` in your `.env` file

### 2. Local Testing with Stripe CLI

#### Install Stripe CLI
```bash
# Windows (with Scoop)
scoop install stripe

# Mac (with Homebrew)
brew install stripe/stripe-cli/stripe
```

#### Forward Webhooks to Local Server
```bash
# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret that you can use for local testing.

### 3. Create Test Packages

Use the admin dashboard to create token packages:
1. Go to `/dashboard` (as admin)
2. Navigate to "Gérer les forfaits"
3. Create packages with type "PACKAGE"

Example package:
- Name: Starter Pack
- Type: PACKAGE
- Tokens: 100
- Price: 10$
- Features: ["100 tokens", "Perfect for small projects"]

### 4. Test the Purchase Flow

#### Using Stripe Test Cards
Use these test card numbers in Stripe Checkout:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Exp: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Declined:**
- Card: `4000 0000 0000 0002`

**Requires Authentication:**
- Card: `4000 0025 0000 3155`

### 5. User Flow

1. User logs in and goes to dashboard
2. Clicks "Acheter des Tokens" in sidebar
3. Selects a token package
4. Clicks "Acheter maintenant"
5. Redirected to Stripe Checkout
6. Completes payment
7. Redirected back with success message
8. Tokens automatically added to company balance

## API Endpoints

### POST /api/checkout
Creates a Stripe checkout session for token purchase.

**Request Body:**
```json
{
  "packageId": "clx123...",
  "companyId": "clx456..."
}
```

**Response:**
```json
{
  "sessionId": "cs_test_..."
}
```

### POST /api/webhooks/stripe
Handles Stripe webhook events (checkout completion, payment failures, etc.)

**Headers:**
- `stripe-signature`: Webhook signature for verification

## Database Schema

Relevant models:
- `Transaction`: Tracks all token purchases
- `Company`: Stores token balance
- `Package`: Defines available token packages

## Security Notes

- ✅ Webhook signature verification prevents unauthorized requests
- ✅ All payments processed through Stripe (PCI compliant)
- ✅ Transaction records created before checkout
- ✅ Tokens only credited after confirmed payment
- ✅ Company ID validation prevents unauthorized purchases

## Troubleshooting

### Webhook Not Receiving Events
1. Check Stripe webhook endpoint URL is correct
2. Verify webhook signing secret in `.env`
3. For local testing, ensure Stripe CLI is running
4. Check webhook logs in Stripe Dashboard

### Tokens Not Added After Payment
1. Check webhook handler logs
2. Verify transaction was created in database
3. Check company exists with correct ID
4. Review Stripe event in dashboard

### Checkout Session Creation Fails
1. Verify Stripe API keys are correct
2. Check package exists and is active
3. Ensure company is associated with user
4. Review API error logs

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Update webhook URL to production domain
- [ ] Test end-to-end purchase flow
- [ ] Set up webhook monitoring/alerts
- [ ] Configure proper error tracking
- [ ] Test refund process (if applicable)
- [ ] Review Stripe Dashboard settings
- [ ] Enable Stripe Radar for fraud prevention

## Support

For issues or questions:
1. Check Stripe Dashboard for payment details
2. Review application logs
3. Check database transaction records
4. Contact Stripe support for payment issues
