# Supabase Security Fix Checklist

## Step 1: Apply SQL Fixes (5 minutes)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `apply_all_security_fixes.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see success messages in the output

## Step 2: Enable Leaked Password Protection (2 minutes)

1. In Supabase Dashboard, go to **Authentication**
2. Click **Policies** tab
3. Find **Password Security** section
4. Toggle ON **"Leaked password protection"**
5. Save changes

## Step 3: Enable MFA Options (3 minutes)

1. Still in **Authentication**, click **Providers** tab
2. Scroll to **Multi-Factor Authentication (MFA)** section
3. Enable **TOTP (Time-based One-Time Password)** - Recommended
4. Optionally enable:
   - **SMS** (requires Twilio setup)
   - **WebAuthn** (for biometric/hardware keys)
5. Save changes

## Step 4: Verify Fixes (2 minutes)

1. Go to **Settings** → **Database**
2. Click **Linter** tab
3. Click **Run Linter**
4. All security warnings should now be resolved ✅

## Expected Results

After completing these steps:
- ✅ No function search_path warnings
- ✅ pg_trgm extension in secure schema
- ✅ Leaked password protection enabled
- ✅ MFA options available for users
- ✅ Database passes security linter

## Troubleshooting

If any SQL errors occur:
- The script includes verification queries at the end
- Check the NOTICE messages for specific issues
- Most common issue: permissions (contact Supabase support if needed)

## Time Required
Total time: ~12 minutes