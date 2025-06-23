# Authentication Issue Fix Guide

## Problem: "User (role: guests) missing scope (account)" Error

This error occurs when user sessions become corrupted or when user roles are incorrectly set to "guests" instead of "user" or "admin".

## Quick Fix Options

### Option 1: Automatic Fix (Recommended)
1. Try logging in normally
2. If the error appears, click the **"Fix Login Issues"** button
3. Click **"Clear Session & Fix"** when prompted
4. Wait for the page to refresh
5. Log in again

### Option 2: Manual Browser Reset
1. Open Developer Tools (F12)
2. Go to **Application** > **Storage**
3. Click **"Clear site data"** for localhost:3000
4. Refresh the page and try logging in again

### Option 3: Command Line Fix
```bash
# Get help and instructions
npm run fix-auth

# Fix specific user (requires admin setup)
npm run fix-auth-user user@example.com
```

### Option 4: Admin Console Fix
1. Log into Appwrite console
2. Go to **Auth** > **Users**
3. Find the affected user
4. Check that user status is **Active**
5. Go to **Databases** > **Users Collection**
6. Find user document and ensure `role` field is set to `"user"` or `"admin"` (not `"guests"`)

## Root Causes

1. **Corrupted browser session** - Browser cache/storage issues
2. **Incorrect user role** - User role set to "guests" instead of "user"
3. **Missing user profile** - User exists in Auth but not in Users collection
4. **Permission configuration** - Appwrite collection permissions not set correctly

## Prevention

1. **Always set proper user roles** during registration
2. **Clear sessions on logout** to prevent corruption
3. **Validate user profiles** after authentication
4. **Handle permission errors gracefully** in the code

## Technical Details

The authentication system now includes:

- **Automatic session clearing** when permission errors are detected
- **User role validation** and correction during login
- **Fallback profile creation** for users missing database profiles
- **Enhanced error handling** with user-friendly messages
- **Session fixer component** for self-service resolution

## Code Changes Made

1. **Enhanced AuthContext** (`lib/context/AuthContext.tsx`):
   - Added `clearInvalidSession()` helper function
   - Improved error handling in `checkAuth()` and `login()` functions
   - Added retry mechanism for session establishment
   - Better role validation and correction

2. **SessionFixer Component** (`components/SessionFixer.tsx`):
   - User-friendly interface for session clearing
   - Automatic page refresh after session clear
   - Clear instructions for users

3. **Login Page Updates** (`app/login/page.tsx`):
   - Added SessionFixer component integration
   - Shows fix option when authentication errors occur
   - Enhanced error detection and user guidance

## Testing the Fix

1. Create a test user with corrupted session
2. Try logging in to trigger the error
3. Verify the "Fix Login Issues" button appears
4. Click it and verify session is cleared
5. Log in again successfully

## Support

If issues persist:
1. Check Appwrite console for user status and permissions
2. Verify database collections and documents exist
3. Review browser console for detailed error messages
4. Contact admin with user email and error details
