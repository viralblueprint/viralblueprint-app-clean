# Production Deployment Checklist

## 🔐 Environment Variables

### Required for Production:
```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (Production - use live keys, not test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Optional Price IDs (if using specific products)
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

## ✅ Pre-Deployment Testing

### 1. Payment Flow Testing
- [ ] New user signup with trial
- [ ] Existing user upgrade
- [ ] Payment method update
- [ ] Subscription cancellation
- [ ] Trial expiration handling

### 2. Authentication Testing
- [ ] User registration
- [ ] Email verification
- [ ] Password reset
- [ ] Session persistence
- [ ] Logout functionality

### 3. Database Testing
- [ ] All migrations applied
- [ ] RLS policies working
- [ ] Indexes optimized
- [ ] Backup strategy in place

## 🚀 Deployment Steps

### 1. Stripe Setup
```bash
# 1. Switch to live mode in Stripe Dashboard
# 2. Create products and prices
# 3. Set up webhook endpoint:
#    https://yourdomain.com/api/webhook/stripe
# 4. Select events:
#    - payment_intent.succeeded
#    - checkout.session.completed
#    - customer.subscription.updated
#    - customer.subscription.deleted
```

### 2. Supabase Setup
```sql
-- Run all migrations in production
-- Check user_subscriptions table exists
-- Verify RLS policies are enabled
```

### 3. Vercel/Hosting Setup
```bash
# Add all environment variables
# Enable automatic deployments
# Set up custom domain
# Configure SSL certificate
```

## 🔍 Security Checklist

- [ ] All API routes check authentication
- [ ] Webhook endpoint validates signatures
- [ ] No sensitive data in client-side code
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (React handles this)

## 📊 Monitoring Setup

### Error Tracking
- [ ] Set up Sentry or similar
- [ ] Add error boundaries in React
- [ ] Log critical errors

### Analytics
- [ ] Google Analytics or Plausible
- [ ] Stripe Dashboard for payments
- [ ] Supabase Dashboard for database

### Alerts
- [ ] Failed payment alerts
- [ ] High error rate alerts
- [ ] Database connection issues
- [ ] API endpoint failures

## 🧪 Critical User Flows to Test

### 1. Complete Purchase Flow
```
1. Visit pricing page
2. Select plan
3. Sign up (new user) or sign in
4. Enter payment details
5. Confirm subscription created in Stripe
6. Verify database record created
7. Check user can access paid features
```

### 2. Cancellation Flow
```
1. User logs in
2. Goes to account settings
3. Cancels subscription
4. Verify cancelled in Stripe
5. Check database updated
6. Confirm access removed after period ends
```

### 3. Webhook Processing
```
1. Trigger test webhook from Stripe
2. Verify signature validation works
3. Check database updates correctly
4. Test retry logic for failures
```

## 📝 Final Checks

- [ ] All console.log statements removed
- [ ] Error messages are user-friendly
- [ ] Loading states implemented
- [ ] Mobile responsive design verified
- [ ] Browser compatibility tested
- [ ] SEO meta tags added
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Privacy Policy and Terms added
- [ ] GDPR compliance (if applicable)

## 🚨 Rollback Plan

1. Keep previous deployment available
2. Database backup before migration
3. Feature flags for gradual rollout
4. Monitoring alerts configured
5. Team communication plan

## 📞 Support Setup

- [ ] Support email configured
- [ ] FAQ page created
- [ ] Billing support documentation
- [ ] Refund policy defined
- [ ] Customer service workflow

## 🎯 Performance Optimization

- [ ] Images optimized and using next/image
- [ ] Code splitting implemented
- [ ] API routes cached appropriately
- [ ] Database queries optimized
- [ ] CDN configured for static assets

## Notes

- Test with REAL credit cards in production (small amounts)
- Have team members test the full flow
- Monitor first 24-48 hours closely
- Keep Stripe test mode active for staging environment