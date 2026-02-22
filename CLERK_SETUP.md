# Clerk Authentication Setup Guide

Clerk makes authentication super easy! Follow these simple steps:

## Step 1: Create a Clerk Account

1. **Sign up for Clerk**
   - Visit: https://clerk.com
   - Click "Sign Up" (free tier available)
   - Create your account

## Step 2: Create a New Application

1. **Create Application**
   - Once logged in, click "Create Application"
   - Choose a name (e.g., "NestWise")
   - Select authentication methods:
     - ✅ Email (recommended)
     - ✅ Google (recommended)
     - ✅ Any other providers you want
   - Click "Create Application"

## Step 3: Get Your API Keys

1. **Copy API Keys**
   - In your Clerk dashboard, go to "API Keys"
   - You'll see two keys:
     - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
     - **Secret Key** (starts with `sk_test_` or `sk_live_`)
   - Copy both keys

## Step 4: Configure Google OAuth (Optional but Recommended)

1. **Enable Google Provider**
   - In Clerk dashboard, go to "User & Authentication" > "Social Connections"
   - Find "Google" and click "Configure"
   - You'll need to:
     - Create OAuth credentials in Google Cloud Console (if you don't have them)
     - Or use Clerk's test credentials for development
   - Follow Clerk's instructions to set up Google OAuth

## Step 5: Update Environment Variables

1. **Create or update `.env.local` file** in the root of your project

2. **Add your Clerk keys:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

3. **Replace the placeholders:**
   - `pk_test_your_publishable_key_here` → Your actual publishable key
   - `sk_test_your_secret_key_here` → Your actual secret key

## Step 6: Install Dependencies

Make sure you've installed the required packages:

```bash
npm install
```

## Step 7: Test Authentication

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the sign-in flow:**
   - Go to `http://localhost:3000`
   - Click "Sign in" in the navigation
   - You should see Clerk's sign-in modal
   - Try signing in with email or Google

3. **Verify it works:**
   - After signing in, you should see your profile picture in the navigation
   - You should be able to access protected routes like `/dashboard`
   - Click "Sign Out" to test the sign-out flow

## Production Setup

When deploying to production (e.g., Vercel):

1. **Update Clerk Settings:**
   - In Clerk dashboard, go to "Domains"
   - Add your production domain (e.g., `nestwise.vercel.app`)
   - Clerk will provide you with production API keys

2. **Update Environment Variables in Vercel:**
   - Go to your Vercel project settings
   - Add environment variables:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → Your production publishable key
     - `CLERK_SECRET_KEY` → Your production secret key

3. **Optional: Configure Custom Domains**
   - If you have a custom domain, add it in Clerk dashboard
   - Update your environment variables accordingly

## Features You Get with Clerk

✅ **Multiple Auth Methods:**
- Email/Password
- Google OAuth
- GitHub, Apple, Microsoft, and more

✅ **User Management:**
- User profiles
- Session management
- Email verification
- Password reset

✅ **Security:**
- Built-in security best practices
- Session management
- CSRF protection

✅ **Easy Integration:**
- Pre-built UI components
- Customizable appearance
- Works seamlessly with Next.js

## Troubleshooting

**Error: "Clerk: Missing publishableKey"**
- Make sure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in your `.env.local`
- Restart your dev server after adding environment variables

**Sign-in modal not appearing:**
- Check browser console for errors
- Verify your publishable key is correct
- Make sure you're using the `SignInButton` component correctly

**Google OAuth not working:**
- Verify Google OAuth is enabled in Clerk dashboard
- Check that your Google OAuth credentials are correctly configured
- Make sure redirect URIs match in both Clerk and Google Console

**Still having issues?**
- Check Clerk documentation: https://clerk.com/docs
- Check your terminal for server errors
- Verify all environment variables are loaded correctly

## Why Clerk?

Clerk is much simpler than setting up NextAuth with Google OAuth manually:
- ✅ No need to configure Google Cloud Console (unless you want custom settings)
- ✅ Pre-built UI components
- ✅ Automatic session management
- ✅ Built-in user management
- ✅ Free tier for development
- ✅ Easy to customize appearance

Enjoy your simplified authentication setup! 🎉
