# 🔧 Spoonacular API Troubleshooting Guide

## 🎯 **Current Status**
- ✅ **Authentication Method**: Correctly implemented (URL param + header)
- ✅ **API Key Format**: Valid 32-character hex string
- ✅ **Environment Variables**: Properly configured
- ❓ **API Key Status**: Needs verification

## 🧪 **Manual API Key Test**

### **Step 1: Test in Browser Console**
1. Open http://localhost:5174/
2. Press F12 → Console
3. Run this command:

```javascript
fetch('https://api.spoonacular.com/recipes/random?apiKey=57b0c0c7e1b347578f5f08f73f31219d&number=1')
  .then(response => {
    console.log('Status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

### **Step 2: Interpret Results**

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 200 | ✅ API key works | No action needed |
| 401 | 🔑 Invalid API key | Get new API key |
| 402 | 💳 Quota exceeded | Wait for reset or upgrade |
| 403 | 🚫 Account suspended | Check Spoonacular account |
| 404 | 📍 Wrong endpoint | Check URL |
| 429 | ⏱️ Rate limited | Wait and retry |

## 🔄 **Get New API Key**

If the current key isn't working:

### **Step 1: Sign up for Spoonacular**
1. Go to https://spoonacular.com/food-api
2. Click "Get API Key" or "Sign Up"
3. Create free account
4. Verify email if required

### **Step 2: Get API Key**
1. Login to your Spoonacular dashboard
2. Go to "My Console" or "API Keys"
3. Copy your API key (32-character string)

### **Step 3: Update Environment Variables**

**Local Development:**
Update `.env.local`:
```bash
VITE_SPOONACULAR_API_KEY=YOUR_NEW_API_KEY_HERE
```

**Netlify Production:**
1. Go to Netlify Dashboard → Site Settings
2. Environment Variables
3. Update `VITE_SPOONACULAR_API_KEY`
4. Trigger new deployment

## 🔍 **Debug Information**

### **What to Look For in Console:**
- `🍽️ Spoonacular API Debug` - Shows API key status
- `🧪 Testing Spoonacular API key` - Shows if key works
- `❌ Spoonacular API Error` - Shows specific errors

### **Common Error Messages:**
- "Invalid API key" → Get new key
- "Quota exceeded" → Wait for daily reset
- "Account suspended" → Contact Spoonacular support
- "Network error" → Check internet connection

## ⚡ **Quick Fix Checklist**

- [ ] Test API key manually in browser console
- [ ] Check Spoonacular account status
- [ ] Verify daily quota usage
- [ ] Get new API key if needed
- [ ] Update environment variables (local + Netlify)
- [ ] Redeploy to Netlify

## 🎯 **Expected Behavior**

When working correctly:
- ✅ Console shows "API Key is valid and working"
- ✅ Recipe search returns real results
- ✅ No "falling back to mock data" messages
- ✅ Recipe details load properly

---

**Next Step**: Run the manual test above and let me know what status code you get!