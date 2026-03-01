# JurisAI Pro - Deployment Guide

## Overview
This guide will help you deploy the updated JurisAI Pro application with the new LLM models to Render.com or any other hosting platform.

---

## What's New in This Update

✅ **6 Additional Open Source LLM Models** added for legal research:
1. Mistral 7B Instruct v0.3 (Legal Reasoning)
2. Llama 3.1 8B Instruct (Enhanced)
3. Microsoft Phi-3.5 Mini (Efficient)
4. Google Gemma 2 9B (Structured Tasks)
5. NousResearch Hermes 3 Llama 3.1 (Advanced Reasoning)
6. Mixtral 8x7B Instruct (Most Advanced)

**Total Models Available**: 9 (1 Premium + 8 Open Source)

---

## Prerequisites

Before deploying, ensure you have:
- [x] GitHub account
- [x] Render.com account (or your preferred hosting platform)
- [x] OpenAI API key (for GPT-4o) - Optional but recommended
- [x] Hugging Face API token (for open source models) - **Required**

---

## Step 1: Get Hugging Face API Token

### Option A: Create New Token
1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: `jurisai-pro-inference`
4. Type: Select **"Read"** (sufficient for inference)
5. Click "Generate token"
6. **Copy the token** (starts with `hf_...`)

### Option B: Use Existing Token
If you already have a Hugging Face token with read access, you can use it.

---

## Step 2: Update Environment Variables on Render

### 2.1 Navigate to Your Render Service
1. Log in to https://dashboard.render.com
2. Go to your `jurisai-pro` service
3. Click on "Environment" in the left sidebar

### 2.2 Add/Update Environment Variables

Add the following environment variable:

```bash
HF_API_TOKEN=hf_your_token_here
```

**Existing Variables to Keep:**
```bash
OPENAI_API_KEY=sk-...  # For GPT-4o (keep this)
JWT_SECRET=your-secret-key
SMTP_USER=your-email@gmail.com  # Optional
SMTP_PASS=your-app-password  # Optional
```

### 2.3 Save Changes
Click "Save Changes" - Render will automatically redeploy with new environment variables.

---

## Step 3: Push Code Changes to GitHub

### 3.1 Stage Changes
```bash
cd d:/Python/jurisai-pro
git add .
```

### 3.2 Commit Changes
```bash
git commit -m "feat: Add 6 new open source LLM models for Indian legal research

- Added Mistral 7B Instruct v0.3 for legal reasoning
- Added Llama 3.1 8B with 128K context window
- Added Microsoft Phi-3.5 Mini for efficient inference
- Added Google Gemma 2 9B for structured tasks
- Added Hermes 3 Llama 3.1 for advanced reasoning
- Added Mixtral 8x7B for complex legal analysis
- Created comprehensive LLM documentation
- Organized models into legal-optimized categories
- Total: 9 models (1 Premium + 8 Open Source)"
```

### 3.3 Push to GitHub
```bash
git push origin main
```

---

## Step 4: Deploy to Render

### Option A: Automatic Deployment (Recommended)
If you have auto-deploy enabled:
1. Render will automatically detect the push to `main` branch
2. Deployment will start within 1-2 minutes
3. Monitor progress in the Render dashboard

### Option B: Manual Deployment
If auto-deploy is disabled:
1. Go to your Render dashboard
2. Click on your `jurisai-pro` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete (2-5 minutes)

---

## Step 5: Verify Deployment

### 5.1 Check Deployment Logs
1. In Render dashboard, go to "Logs" tab
2. Look for successful startup messages:
```
✦ JurisAI Pro server running at http://localhost:10000
  OpenAI Token: ✓ configured
  HF Token: ✓ configured
```

### 5.2 Test the Application
1. Visit: https://jurisai-pro-t3hf.onrender.com/
2. Navigate to the AI Assistant section
3. Click on "4. Select AI Model" dropdown
4. **Verify all 9 models are visible:**
   - GPT-4o (OpenAI Premium)
   - Legal-Optimized Models section (3 models)
   - General Purpose Open Source section (3 models)
   - Specialized Models section (2 models)

### 5.3 Test a Model
1. Select any open source model (e.g., "Mistral 7B Instruct")
2. Enter a test query: "What is Section 498A IPC?"
3. Click Send
4. Verify you get a legal response

---

## Step 6: Model Testing Checklist

Test at least 3 different models to ensure they work:

- [ ] **GPT-4o** - Premium model (exhaustive reports)
- [ ] **Mistral 7B Instruct** - Legal reasoning
- [ ] **Llama 3.1 8B** - Long context (128K tokens)
- [ ] **Phi-3.5 Mini** - Fast summaries
- [ ] **Qwen 2.5 7B** - Multilingual (Hindi/English)
- [ ] **Hermes 3 Llama 3.1** - Advanced reasoning
- [ ] **Mixtral 8x7B** - Most advanced open source

---

## Troubleshooting

### Issue 1: Models Not Appearing in Dropdown
**Symptom**: Only GPT-4o appears, no open source models

**Solution**:
1. Clear browser cache (Ctrl+F5)
2. Check if `index.html` was deployed correctly
3. View page source and search for "Legal-Optimized Models"

### Issue 2: "HF_API_TOKEN not configured" Error
**Symptom**: Error when selecting open source models

**Solution**:
1. Verify `HF_API_TOKEN` is set in Render environment variables
2. Redeploy the service
3. Check logs for "HF Token: ✓ configured"

### Issue 3: Model Timeout Errors
**Symptom**: "Server error. Please try again" when using large models

**Solution**:
1. Try a smaller model first (Phi-3.5 Mini, Gemma 2)
2. Hugging Face may be cold-starting the model (first request takes longer)
3. Retry after 30 seconds

### Issue 4: Rate Limiting
**Symptom**: "Rate limit exceeded" error

**Solution**:
1. Hugging Face free tier has rate limits
2. Wait a few minutes between requests
3. Consider upgrading to Hugging Face Pro ($9/month) for higher limits

---

## Performance Optimization Tips

### 1. Model Selection Strategy
- **For Quick Queries**: Use Phi-3.5 Mini or Gemma 2 (fastest)
- **For Comprehensive Reports**: Use GPT-4o or Mixtral 8x7B
- **For Hindi/English**: Use Qwen 2.5 7B
- **For Complex Reasoning**: Use Hermes 3 or Mixtral 8x7B

### 2. Cost Optimization
- Open source models via Hugging Face are **significantly cheaper** than GPT-4o
- Free tier: 1,000 API calls/day per model
- Pro tier ($9/month): Unlimited API calls

### 3. Context Window Management
- Models with 128K context (Llama 3.1, Phi-3.5, Hermes 3) can handle longer documents
- Models with 8K context (Llama 3, Gemma 2) are faster but handle less text

---

## Monitoring & Analytics

### Key Metrics to Monitor:
1. **Response Times** per model
2. **User preferences** (which models are most used)
3. **Error rates** per model
4. **Cost per query** (especially for GPT-4o)

### Recommended Tools:
- **Render Metrics**: Built-in CPU/Memory monitoring
- **Hugging Face Dashboard**: API usage statistics
- **OpenAI Dashboard**: GPT-4o usage and costs

---

## Scaling Considerations

### When to Upgrade:

**Hugging Face:**
- Free tier: Good for 100-500 queries/day
- Pro tier ($9/month): Good for 5,000+ queries/day
- Enterprise: Custom pricing for high volume

**Render:**
- Starter ($7/month): 512MB RAM - adequate for current setup
- Standard ($25/month): 2GB RAM - recommended for 1,000+ users
- Pro ($85/month): 8GB RAM - for heavy production use

---

## Security Best Practices

### ✅ Do's:
- Store API keys in environment variables (never in code)
- Enable HTTPS (Render does this automatically)
- Use JWT for authentication
- Implement rate limiting (already implemented)
- Monitor logs for suspicious activity

### ❌ Don'ts:
- Never commit API keys to GitHub
- Don't expose internal model names to end users
- Don't log user queries (GDPR compliance)
- Don't allow unlimited query lengths

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback (Render):
1. Go to Render dashboard
2. Click "Rollback" button
3. Select previous working deployment
4. Confirm rollback

### Git Rollback:
```bash
# Find the previous commit
git log --oneline

# Rollback to specific commit
git revert <commit-hash>
git push origin main
```

---

## Post-Deployment Checklist

- [ ] All 9 models visible in dropdown
- [ ] GPT-4o works correctly
- [ ] At least 3 open source models tested successfully
- [ ] No console errors in browser
- [ ] Mobile responsive design intact
- [ ] Authentication system working
- [ ] Copy/Export PDF features working
- [ ] Rate limiting functional
- [ ] HTTPS enabled
- [ ] Environment variables secured

---

## Next Steps

### Immediate (Week 1):
1. Monitor error rates and user feedback
2. Test all 9 models with real legal queries
3. Gather performance metrics
4. Document any issues

### Short-term (Month 1):
1. Analyze which models users prefer
2. Consider removing underperforming models
3. Fine-tune temperature/token settings
4. Add model response time indicators

### Long-term (Quarter 1):
1. Implement RAG with Indian case law database
2. Fine-tune models on Indian legal corpus
3. Add local deployment option (Ollama)
4. Create custom legal-specific embeddings

---

## Support Resources

### Documentation:
- **LLM Models**: See `LLM_MODELS_DOCUMENTATION.md`
- **Hugging Face Docs**: https://huggingface.co/docs/api-inference
- **Render Docs**: https://render.com/docs

### Community:
- **GitHub Issues**: https://github.com/N7-py/jurisai-pro/issues
- **Hugging Face Forums**: https://discuss.huggingface.co
- **Render Community**: https://community.render.com

---

## Changelog

### Version 2.1.0 (Current)
- ✅ Added 6 new open source LLM models
- ✅ Organized models into categories
- ✅ Created comprehensive documentation
- ✅ Maintained backward compatibility

### Version 2.0.0 (Previous)
- Initial release with GPT-4o, Llama 3, Qwen 2.5

---

**Deployment Completed Successfully!** 🎉

Your JurisAI Pro application now supports 9 powerful LLM models optimized for Indian legal research.

For questions or issues, please create a GitHub issue at:
https://github.com/N7-py/jurisai-pro/issues