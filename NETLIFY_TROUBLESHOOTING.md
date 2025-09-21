# 🚨 Netlify Environment Variable Fix Guide

## Current Issue
Netlify is still using `your_spoonacular_api_key` instead of the new API key `7e3dce479d8242c0b7b868714b1e37f5`.

## Step-by-Step Fix

### 1. Update Netlify Environment Variables
1. Go to: https://app.netlify.com
2. Log in and find your **mealmind** site
3. Click on your site name to enter the site dashboard
4. Click **Site settings** (top navigation)
5. Click **Environment variables** (left sidebar)
6. Look for `VITE_SPOONACULAR_API_KEY`
7. Click the **Options** menu (3 dots) → **Edit**
8. Replace the value with: `7e3dce479d8242c0b7b868714b1e37f5`
9. Click **Save**

### 2. Trigger New Deployment
After saving the environment variable:
- Go to **Deploys** tab
- Click **Trigger deploy** → **Deploy site**
- Wait for deployment to complete (usually 1-2 minutes)

### 3. Verify Environment Variables Are Set
In the Netlify dashboard, you should see:
```
VITE_SPOONACULAR_API_KEY = 7e3dce479d8242c0b7b868714b1e37f5
VITE_SUPABASE_URL = https://xomllgblqmryqokgjxnr.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test After Deployment
1. Visit your Netlify site
2. Open Developer Tools (F12) → Console
3. Look for the debug logs
4. The API URL should show: `apiKey=API_KEY_HIDDEN` (not `your_spoonacular_api_key`)
5. You should see successful API responses instead of 401 errors

## Expected Results
✅ **Success logs:**
- `🚀 Making Spoonacular API request...`
- `📡 Spoonacular API response: Object` (with recipe data)
- Real recipes displayed instead of "Mock Recipe"

❌ **Failure logs (current issue):**
- `Failed to load resource: the server responded with a status of 401`
- `🔑 Spoonacular API: Unauthorized (invalid API key)`
- `🔄 Using offline mode - returning mock recipes`

## Troubleshooting
If the issue persists:
1. Double-check the environment variable name is exactly: `VITE_SPOONACULAR_API_KEY`
2. Double-check the API key value is exactly: `7e3dce479d8242c0b7b868714b1e37f5`
3. Make sure you triggered a new deployment after updating the variable
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

## Contact Support
If none of the above works, the issue might be:
- Netlify caching the old environment variables
- API key might be invalid or expired
- Environment variable not being read properly by Vite in production