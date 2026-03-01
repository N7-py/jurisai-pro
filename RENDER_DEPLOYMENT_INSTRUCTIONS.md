# 🚀 Render Deployment Instructions - FINAL SETUP

## ⚠️ CRITICAL: Environment Variables Required

**You need to add your HuggingFace token to Render!**

Your token starts with `hf_` (you provided it earlier in our conversation)

You MUST add this to Render for HF models to work!

---

## 📋 Step-by-Step Deployment

### Step 1: Access Render Dashboard

1. Go to https://dashboard.render.com
2. Log in with your account
3. Find your **`jurisai-pro`** service
4. Click on it to open

---

### Step 2: Add Environment Variables

1. In the left sidebar, click **"Environment"**
2. You should see existing variables like:
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - Maybe `SMTP_USER`, `SMTP_PASS`

3. **Add HF_API_TOKEN:**
   - Click **"Add Environment Variable"**
   - Key: `HF_API_TOKEN`
   - Value: `[YOUR_HF_TOKEN_HERE]` (the one you provided earlier)
   - Click **"Save Changes"**

---

### Step 3: Verify All Required Variables

Make sure you have these environment variables set:

```
OPENAI_API_KEY=sk-...  (your OpenAI key)
HF_API_TOKEN=hf_...  (your HuggingFace token)
JWT_SECRET=your-secret-key
```

Optional (for email verification):
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

### Step 4: Deploy Latest Code

After saving environment variables, Render will automatically trigger a redeploy.

**OR manually deploy:**

1. Click **"Manual Deploy"** button (top right)
2. Select **"Deploy latest commit"**
3. Click **"Deploy"**

---

### Step 5: Monitor Deployment

1. Watch the **"Logs"** tab
2. Wait for build to complete (2-5 minutes)
3. Look for these messages:

```
✦ JurisAI Pro server running at http://localhost:10000
  OpenAI Token: ✓ configured
  HF Token: ✓ configured  ← This should appear now!
```

**If you see:** `HF Token: ✗ MISSING`
→ Go back and add `HF_API_TOKEN` correctly

---

### Step 6: Update Frontend (Re-enable HF Models)

Since you now have a valid HF token, I can re-enable the HuggingFace models!

**Current state:** Only GPT-4o available  
**After fix:** GPT-4o + 6 HuggingFace models

---

## ✅ What Happens After Deployment

Once deployed with `HF_API_TOKEN` set:

1. ✅ GPT-4o works (via OpenAI)
2. ✅ All HuggingFace models should work
3. ✅ Users get choice of 7 total models
4. ✅ Cost-effective open-source options available

---

## 🧪 Testing After Deployment

1. **Clear browser cache** (Ctrl + Shift + R)
2. **Open your deployed site**
3. **Check model dropdown** - should show:
   - GPT-4o (Premium)
   - Meta Llama 3 8B
   - Zephyr 7B
   - Mistral 7B v0.1
   - And more...
4. **Test a model:**
   - Select "Zephyr 7B" (most reliable HF model)
   - Enter: "What is Section 498A IPC?"
   - Click Send
   - Should get response within 30-60 seconds

---

## 🚨 Troubleshooting

### Issue: "HF_API_TOKEN not configured"
**Solution:** Token not set in Render environment variables
- Go back to Step 2 and add it

### Issue: "Model not found" or "Not a chat model"
**Solution:** HuggingFace API issue or wrong model ID
- Try different model (Zephyr 7B most reliable)
- Check server logs for exact error

### Issue: Models timeout on first request
**Solution:** HuggingFace "cold start" - models need to load
- Wait 60 seconds
- Try again - should be fast second time

---

## 📊 Expected Behavior

### First Request to HF Model:
- ⏱️ 30-60 seconds (model loading)
- May timeout first time
- This is normal

### Subsequent Requests:
- ⏱️ 5-15 seconds
- Much faster
- Model stays "warm"

---

## 🎯 Current Status Checklist

- [x] HuggingFace token obtained
- [ ] Token added to Render environment variables
- [ ] Service redeployed
- [ ] Logs show "HF Token: ✓ configured"
- [ ] Frontend updated to show HF models
- [ ] Browser cache cleared
- [ ] Models tested and working

---

## 📝 Next Steps

1. **NOW:** Add `HF_API_TOKEN` to Render (Step 2)
2. **WAIT:** For automatic redeploy (2-5 min)
3. **CHECK:** Logs show HF token configured
4. **REPLY:** "Done" so I can re-enable HF models in frontend
5. **TEST:** Clear cache and test models

---

## ℹ️ Your HuggingFace Token Info

**Token:** The one you provided earlier (starts with `hf_`)  
**Type:** Read-only (correct for API access)  
**Status:** Valid format ✅  
**What it enables:** Access to HuggingFace's serverless inference API

**Models it will enable:**
- Meta Llama 3 8B (most reliable)
- Zephyr 7B (always available)
- Mistral 7B v0.1 (fast)
- Llama 3.1 8B (extended context)
- Mistral Nemo 12B (larger model)
- Qwen 2.5 7B (multilingual)

---

**⚡ Action Required:** Add `HF_API_TOKEN` to Render environment variables NOW, then let me know when done!