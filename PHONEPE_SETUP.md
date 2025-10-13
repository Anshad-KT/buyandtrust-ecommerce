# PhonePe Payment Gateway Integration Setup

This guide will help you configure the PhonePe payment gateway for your e-commerce application.

## Prerequisites

1. PhonePe Merchant Account
2. PhonePe API Credentials (Client ID, Client Secret)
3. Node.js and npm installed

## Environment Variables Configuration

Add the following environment variables to your `.env.local` file:

```env
# PhonePe Configuration
PHONEPE_CLIENT_ID=your_client_id_here
PHONEPE_CLIENT_SECRET=your_client_secret_here
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=SANDBOX

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Environment Variables Explained

- **PHONEPE_CLIENT_ID**: Your PhonePe merchant client ID (provided by PhonePe)
- **PHONEPE_CLIENT_SECRET**: Your PhonePe merchant client secret (keep this secure!)
- **PHONEPE_CLIENT_VERSION**: API version (usually `1`)
- **PHONEPE_ENV**: Environment mode
  - `SANDBOX` - For testing (use this during development)
  - `PRODUCTION` - For live transactions (use only after thorough testing)
- **NEXT_PUBLIC_BASE_URL**: Your application's base URL
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

## Installation

The PhonePe SDK is already included in the project. If you need to reinstall it:

```bash
npm install pg-sdk-node
```

## How It Works

### Payment Flow

1. **User initiates payment** on the checkout page
2. **Address validation** ensures all required fields are filled
3. **Order creation** in your database (via `EcomService.create_order`)
4. **Payment request** is sent to PhonePe API (server-side via `/api/phonepe/create-order`)
5. **User redirect** to PhonePe payment page
6. **Payment completion** and redirect back to callback page
7. **Order confirmation** displayed to user

### Files Modified/Created

#### Server-Side (API Route)
- `src/app/api/phonepe/create-order/route.ts` - Handles PhonePe SDK calls securely

#### Client-Side (Payment Component)
- `src/app/(protected)/payment/_components/Payment.tsx` - Updated to call server API

#### Callback Page
- `src/app/payment/callback/page.tsx` - Handles payment success/failure responses

## Testing in Sandbox Mode

1. Set `PHONEPE_ENV=SANDBOX` in your `.env.local`
2. Use PhonePe test credentials provided by PhonePe
3. Test with PhonePe sandbox test cards/UPI IDs
4. Verify payment flow end-to-end

## Going to Production

### Before Going Live:

1. **Update environment variables:**
   ```env
   PHONEPE_ENV=PRODUCTION
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

2. **Security checklist:**
   - ✅ Never commit `.env.local` to version control
   - ✅ Use environment variables in production hosting (Vercel, etc.)
   - ✅ Enable HTTPS on your domain
   - ✅ Verify PhonePe webhook signatures (if using webhooks)
   - ✅ Test thoroughly in sandbox before switching to production

3. **Server-side verification:**
   - The current implementation redirects to a callback page
   - For production, implement server-side payment verification
   - Use PhonePe's transaction status API to verify payment before confirming orders

## Payment Amount Format

PhonePe requires amounts in **paise** (smallest currency unit):
- ₹100.00 = 10000 paise
- The code automatically converts: `Math.round(totalPrice * 100)`

## Callback URL

The payment callback URL is automatically set to:
- Development: `http://localhost:3000/payment/callback`
- Production: `https://yourdomain.com/payment/callback`

PhonePe will redirect users to this URL after payment completion with status parameters.

## Troubleshooting

### Common Issues

1. **"PhonePe credentials not configured"**
   - Ensure all environment variables are set in `.env.local`
   - Restart your development server after adding variables

2. **Payment redirect not working**
   - Check `NEXT_PUBLIC_BASE_URL` is correct
   - Verify PhonePe credentials are valid
   - Check browser console for errors

3. **Callback page not receiving status**
   - Verify callback URL is accessible
   - Check PhonePe dashboard for webhook configuration
   - Ensure no CORS issues

## Support

- PhonePe Documentation: [https://developer.phonepe.com/](https://developer.phonepe.com/)
- PhonePe Support: Contact your PhonePe account manager

## Security Notes

⚠️ **IMPORTANT:**
- Never expose `PHONEPE_CLIENT_SECRET` in client-side code
- All PhonePe SDK calls are made server-side only
- Validate all payment responses server-side before confirming orders
- Use HTTPS in production
- Implement proper error handling and logging

## Next Steps

1. Obtain PhonePe credentials from PhonePe merchant portal
2. Add credentials to `.env.local`
3. Test payment flow in sandbox mode
4. Implement server-side payment verification (recommended for production)
5. Test thoroughly before going live
6. Switch to production environment

---

**Note:** This integration uses the PhonePe Standard Checkout flow. For custom payment flows or additional features, refer to the PhonePe API documentation.
