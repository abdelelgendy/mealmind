# 🚀 Netlify Deployment Fix Guide

## 🔍 **Problem Identified**
Your app runs in **online mode locally** but **offline mode on Netlify** because:
- ✅ Local: Environment variables are available in `.env.local`
- ❌ Netlify: Environment variables not configured in dashboard

## 🛠️ **Solution Steps**

### **Step 1: Add Environment Variables to Netlify**

1. **Go to your Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Select your MealMind site

2. **Navigate to Environment Variables**
   - Click "Site Settings"
   - Go to "Environment Variables" in the sidebar
   - Click "Add a variable"

3. **Add These Variables:**

```bash
Key: VITE_SUPABASE_URL
Value: https://xomllgblqmryqokgjxnr.supabase.co

Key: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbWxsZ2JscW1yeXFva2dqeG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjMwMzksImV4cCI6MjA3MDY5OTAzOX0.m2EiYqXklJyb012_iGjl0g7sJbFhWUOVuKApIm6i2Wk

Key: VITE_SPOONACULAR_API_KEY
Value: 57b0c0c7e1b347578f5f08f73f31219d

Key: VITE_NODE_ENV
Value: production
```

### **Step 2: Trigger a New Deployment**

After adding the environment variables:

1. **Go to "Deploys" tab in Netlify**
2. **Click "Trigger deploy"** → **"Deploy site"**
3. **Wait for build to complete**

### **Step 3: Verify the Fix**

After deployment completes:
- ✅ Visit your Netlify site URL
- ✅ Check browser console (F12) for Supabase connection logs
- ✅ Try adding pantry items - should show success notifications instead of "offline mode"

## 🔧 **Local Development Fixed**

I've also moved your environment variables to the root directory so they work with the current project structure:

- ✅ **Created**: `/mealmind/.env.local` (root level)
- ✅ **Contains**: Your Supabase and API credentials
- ✅ **Local dev**: Now works properly from root directory

## 📋 **Quick Checklist**

- [ ] Add environment variables to Netlify dashboard
- [ ] Trigger new deployment
- [ ] Test deployed site functionality
- [ ] Verify online mode (no more "offline mode" messages)

## 🎯 **Expected Result**

After these steps:
- **Local**: ✅ Online mode (already working)
- **Netlify**: ✅ Online mode (will work after env vars are set)
- **Features**: Full Supabase integration with user accounts, data sync, etc.

## 🚨 **Important Notes**

- The Supabase anon key is safe to expose in client-side code
- These are public environment variables, not secret server-side keys
- The `.env.local` file is ignored by git (won't be committed)

---

Once you complete Step 1 and Step 2, your Netlify deployment will run in online mode with full Supabase functionality! 🚀