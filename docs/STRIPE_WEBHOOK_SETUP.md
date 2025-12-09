# Stripe Webhook Local Testing Setup

This guide helps you set up Stripe webhooks for local development.

## Quick Start

### 1. Install Stripe CLI

**Windows (PowerShell - Run as Administrator):**
```powershell
# Using Scoop
scoop install stripe

# Or download from: https://github.com/stripe/stripe-cli/releases/latest
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download the latest release
wget https://github.com/stripe/stripe-cli/releases/download/v1.21.3/stripe_1.21.3_linux_x86_64.tar.gz

# Extract
tar -xvf stripe_1.21.3_linux_x86_64.tar.gz

# Move to bin
sudo mv stripe /usr/local/bin/
```

### 2. Login to Stripe
```bash
stripe login
```

This will open your browser to authenticate with Stripe.

### 3. Forward Webhooks to Local Server

**Start your Next.js dev server first:**
```bash
npm run dev
```

**In a new terminal, run:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 4. Update Environment Variables

Copy the webhook signing secret from the output and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Test the Webhook

**Trigger a test event:**
```bash
stripe trigger checkout.session.completed
```

Check your terminal logs to see the webhook being processed.

## Testing Token Purchase Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Start webhook forwarding (in another terminal):**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Open your app:**
   - Navigate to http://localhost:3000/dashboard/buy-tokens
   - Select a token package
   - Click "Acheter maintenant"

4. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

5. **Complete checkout**
   - You'll be redirected back to the buy-tokens page
   - Tokens will be automatically added to your company balance
   - Check the webhook terminal for processing logs

## Common Test Cards

| Scenario | Card Number |
|----------|-------------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| Insufficient Funds | 4000 0000 0000 9995 |
| Requires 3D Secure | 4000 0025 0000 3155 |

## Troubleshooting

### Webhook Not Receiving Events
- Ensure your dev server is running on port 3000
- Check that Stripe CLI is forwarding to the correct URL
- Verify the webhook secret in your `.env` file matches the CLI output

### Tokens Not Added After Payment
- Check the webhook terminal for error messages
- Verify the transaction was created in your database
- Check company balance before and after payment

### Port Already in Use
If port 3000 is already in use, update the forward URL:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

## Production Setup

For production, you'll need to:

1. **Create a webhook endpoint in Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/webhooks
   - Click "Add endpoint"
   - Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select the same events as in development
   - Copy the signing secret to your production environment variables

2. **Update your environment variables:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_production_secret_here
   STRIPE_SECRET_KEY=sk_live_your_live_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

3. **Test thoroughly before going live**

## Need Help?

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Stripe](https://stripe.com/docs/testing)
