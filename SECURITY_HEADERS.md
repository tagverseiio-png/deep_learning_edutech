<!--
Production Security Headers Configuration

These headers should be added by your hosting platform (Vercel, server, etc.)
or in a _headers or netlify.toml file.

For Vercel: Add to vercel.json headers section
For Netlify: Add to netlify.toml
For custom server: Add to your server configuration

Headers recommended for production:
-->

<!DOCTYPE html>
<html>
<head>
  <!-- Security Headers -->
  <!-- Content Security Policy - Prevents XSS attacks -->
  <!-- X-Content-Type-Options - Prevents MIME type sniffing -->
  <!-- X-Frame-Options - Prevents clickjacking -->
  <!-- X-XSS-Protection - Legacy XSS protection -->
  <!-- Referrer-Policy - Controls referrer information -->
  <!-- Permissions-Policy - Controls browser features -->
  
  <!-- These should be set by your server/hosting platform, not in HTML -->
</head>
<body>
  <!-- Security notes for implementation -->
  <!--
  1. Vercel (.vercel/project.json or Environment Variables):
     - Add security headers via Vercel dashboard
     
  2. Content Security Policy (CSP) should include:
     - API domain (your backend VM)
     - Razorpay domain for payment processing
     - Google Fonts for typography
     - Chart libraries (Recharts)
     
  3. CORS Configuration:
     - Backend should allow requests from your Vercel domain
     - Example: https://your-frontend.vercel.app
     
  4. Environment Secrets:
     - Never commit sensitive data
     - Use Vercel environment variables for API keys
     - Razorpay key is public, but never expose private key
  -->
</body>
</html>
