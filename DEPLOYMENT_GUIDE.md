# Vercel Deployment Guide

## Step 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and log in to your account
2. Click the **+** icon in top-right → "New repository"
3. Repository name: `satyam-sharma-portfolio`
4. Description: `Satyam Sharma's Professional Portfolio - Dark Tech Theme`
5. Choose visibility: **Public** (recommended for portfolio)
6. Click **Create repository**

## Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Run these in PowerShell:

```powershell
cd "c:\Users\Divyansh\Downloads\Satyam Portfolio"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/satyam-sharma-portfolio.git

# Rename branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```

## Step 3: Create a New Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose a sign-up method:
   - GitHub (recommended - easiest integration)
   - GitLab
   - Bitbucket
   - Email
4. Complete the sign-up process

## Step 4: Deploy on Vercel

### Method 1: Import from GitHub (Recommended)

1. After sign-up, click **New Project**
2. Click **Continue with GitHub**
3. Select the repository: `satyam-sharma-portfolio`
4. Click **Import**
5. In the configuration page:
   - Framework Preset: **Other** (since it's a static site)
   - Build Command: Leave empty or `echo 'No build required'`
   - Output Directory: Leave empty (root directory)
6. Click **Deploy**

Vercel will automatically deploy your site! 🚀

### Method 2: Manual Upload

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```

2. Deploy from your project directory:
   ```powershell
   cd "c:\Users\Divyansh\Downloads\Satyam Portfolio"
   vercel
   ```

3. Follow the prompts to log in and deploy

## Step 5: Get Your Live URL

After deployment completes, Vercel provides a URL like:
- `https://satyam-sharma-portfolio.vercel.app`

You can:
1. Copy this URL and share it with others
2. Add a custom domain (see next section)

## Step 6 (Optional): Add Custom Domain

1. In Vercel Dashboard, go to your project
2. Click **Settings** → **Domains**
3. Enter your custom domain (e.g., `satyamportfolio.com`)
4. Click **Add**
5. Follow the DNS configuration instructions
6. Update your domain registrar's DNS records

## Step 7 (Optional): Update Social Links

Before final deployment, update contact information in `index.html`:

```html
<!-- Find and update these links in the contact section -->
<a href="mailto:satyam@example.com">
<a href="https://linkedin.com/in/satyamsharma" target="_blank">
<a href="https://github.com/satyamsharma" target="_blank">
<a href="https://twitter.com/satyamsharma" target="_blank">
```

## Deployment Complete! ✨

Your portfolio is now live at: **https://satyam-sharma-portfolio.vercel.app**

### What Vercel Gives You:

- ✅ Free hosting
- ✅ Global CDN (fast loading worldwide)
- ✅ Automatic HTTPS (SSL certificate)
- ✅ Custom domain support
- ✅ Automatic deployments on GitHub push
- ✅ Analytics and monitoring

## Future Updates

To update your portfolio:

1. Make changes locally
2. Commit and push to GitHub:
   ```powershell
   git add .
   git commit -m "Update portfolio content"
   git push
   ```
3. Vercel automatically redeploys!

## Troubleshooting

### Issue: "Repository not found"
**Solution:** Make sure you:
- Logged into Vercel with the same GitHub account
- Pushed code to GitHub successfully
- Repository is public

### Issue: "Build failed"
**Solution:** 
- Check that `vercel.json` configuration is correct
- Ensure all files are committed and pushed
- Check Vercel build logs for specific errors

### Issue: "Page shows 404"
**Solution:**
- Make sure `vercel.json` has rewrites configured
- Clear browser cache
- Wait a few seconds for deployment to complete

## Support

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Help:** https://docs.github.com
- **For issues:** Check your email for Vercel notifications

---

**Happy Hosting! Your portfolio is now live for the world to see! 🌍**
