# Supabase Auth Security Configuration

## Fixing Auth Security Warnings

### 1. Enable Leaked Password Protection

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Policies** 
3. Find **Password Security** section
4. Toggle ON **"Leaked password protection"**
   - This checks passwords against HaveIBeenPwned database
   - Prevents users from using compromised passwords

### 2. Enable Additional MFA Options

1. Go to **Authentication** → **Providers**
2. Scroll to **Multi-Factor Authentication (MFA)** section
3. Enable at least 2 of the following:
   - **TOTP (Time-based One-Time Password)** - Recommended
     - Works with apps like Google Authenticator, Authy
   - **SMS** - If you have Twilio configured
   - **WebAuthn** - For biometric/hardware key authentication

### 3. Recommended MFA Configuration

```javascript
// In your app, you can enforce MFA for sensitive operations:
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
})

// Verify MFA during login
const { data, error } = await supabase.auth.mfa.verify({
  factorId: 'factor-id',
  challengeId: 'challenge-id',
  code: '123456'
})
```

### 4. Additional Security Recommendations

1. **Enable Email Confirmations**
   - Authentication → Providers → Email → Enable "Confirm email"

2. **Set Password Requirements**
   - Authentication → Policies → Password Requirements
   - Minimum length: 8+ characters
   - Require uppercase, lowercase, numbers, special characters

3. **Configure Session Duration**
   - Authentication → Settings
   - Set appropriate JWT expiry time (default: 1 hour)
   - Set refresh token expiry (default: 1 week)

4. **Enable Rate Limiting**
   - Authentication → Rate Limits
   - Configure limits for:
     - Sign up attempts
     - Sign in attempts
     - Password reset requests

## SQL Script Application

1. Copy the contents of `fix_security_warnings.sql`
2. Go to Supabase Dashboard → SQL Editor
3. Paste and run the script
4. This will fix all database function search_path warnings

## Verification

After applying these changes:
1. Go to **Settings** → **Database** → **Linter**
2. Run the linter again
3. Security warnings should be resolved

## Notes

- The pg_trgm extension move might require recreating text search indexes
- Test authentication flow after enabling MFA
- Consider gradual MFA rollout for existing users