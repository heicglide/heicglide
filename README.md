# HEIC Glide static site

## Deploy to GitHub Pages

1. Upload all files in this folder to the root of the `heicglide` repository.
2. Keep `CNAME` in the repository root with exactly `heicglide.com`.
3. In GitHub Pages, use the `main` branch and `/ (root)`.
4. Keep the Namecheap DNS records already configured:
   - A `@` → `185.199.108.153`
   - A `@` → `185.199.109.153`
   - A `@` → `185.199.110.153`
   - A `@` → `185.199.111.153`
   - CNAME `www` → `heicglide.github.io`
5. Wait for GitHub Pages HTTPS to become available, then enable **Enforce HTTPS**.

## Important

The converter loads `heic2any` from jsDelivr only when a user starts a conversion. The page itself is static and works on GitHub Pages without a build step.
