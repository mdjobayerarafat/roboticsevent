# Admin User Setup Guide

This guide explains how to set up admin users for the NCC Robotics Workshop website.

## How Admin Login Works

When a user logs in, the system checks their `role` field in the Appwrite database:
- If `role = 'admin'` → User is redirected to `/admin` (Admin Panel)
- If `role = 'user'` → User is redirected to `/user` (User Dashboard)

## Method 1: Using Browser Console (Recommended)

1. **Login as any user** and navigate to the admin page at `/admin`
2. **Open browser console** (F12 → Console tab)
3. **Run the command**:
   ```javascript
   setUserAsAdmin("user@example.com")
   ```
   Replace `user@example.com` with the actual email address of the user you want to make admin.

4. **Check the console output** for success confirmation
5. **The user can now login** and will be automatically redirected to the admin panel

## Method 2: Direct Appwrite Console

1. **Go to your Appwrite Console** (usually `http://localhost/console` or your hosted URL)
2. **Navigate to**: Databases → Your Database → Users Collection
3. **Find the user** you want to make admin
4. **Click Edit** on the user document
5. **Change the `role` field** from `"user"` to `"admin"`
6. **Save the changes**

## Method 3: Using the Admin Management Tab

1. **Login as an existing admin**
2. **Go to Admin Panel** → User Management tab
3. **Search for the user** by email or name
4. **Click "Make Admin"** button next to their name
5. **The role will be updated** automatically

## Verifying Admin Access

After setting a user as admin:

1. **User logs out** and logs back in
2. **User should be automatically redirected** to `/admin` instead of `/user`
3. **Admin Panel should load** with all admin features available

## Admin Features

Admin users have access to:

- **User Management**: View and manage all registered users
- **Announcements**: Create and manage announcements
- **Resources**: Upload and manage workshop resources
- **Statistics**: View registration statistics and analytics
- **PDF Export**: Export user data as PDF reports
- **Role Management**: Promote other users to admin or demote admins to users

## Database Structure

The `role` field in the Users collection can have these values:
- `"user"` - Regular user (default)
- `"admin"` - Administrator with full access
- `"guests"` - Legacy role (should be updated to "user")

## Security Notes

- Only promote trusted users to admin role
- Admin users have full access to all user data
- Consider implementing role-based permissions for different admin levels if needed
- Always verify admin setup in a development environment first

## Troubleshooting

**User not redirected after role change:**
- User needs to log out and log back in
- Check browser cache and refresh the page
- Verify the role was actually updated in Appwrite

**Console function not available:**
- Make sure you're on the admin page (`/admin`)
- Check if user has admin permissions
- Refresh the page and try again

**Permission errors:**
- Check Appwrite permissions for the Users collection
- Ensure admin user has read/write access to user documents
