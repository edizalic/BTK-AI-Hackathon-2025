# Hostinger Deployment Guide for Next.js SSR App

## Overview
This Next.js application uses Server-Side Rendering (SSR) and requires Node.js hosting on Hostinger.

## Prerequisites
- Hostinger hosting plan with Node.js support
- Access to Hostinger control panel

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Prepare Files for Upload
The build output will be in the `output` directory. You'll need to upload:
- All files from the `output` directory
- The `.htaccess` file (for Apache configuration)
- `package.json` and `package-lock.json` (for dependencies)

### 3. Upload to Hostinger

#### Option A: Using File Manager
1. Log into your Hostinger control panel
2. Navigate to File Manager
3. Upload the contents of the `output` directory to your `public_html` folder
4. Upload `package.json` and `package-lock.json` to the same directory
5. Upload the `.htaccess` file to the root of your domain

#### Option B: Using Git (Recommended)
1. Connect your GitHub repository to Hostinger
2. Set the build command: `npm run build`
3. Set the output directory: `output`
4. Set the Node.js version: `18` or higher

### 4. Install Dependencies
In your Hostinger control panel:
1. Navigate to Node.js section
2. Install dependencies: `npm install --production`
3. Set the start command: `npm start`

### 5. Environment Variables
Set these environment variables in your Hostinger control panel:
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=your_backend_api_url
```

### 6. Domain Configuration
1. Point your domain to the Node.js application
2. Ensure the `.htaccess` file is in the root directory
3. Configure SSL if needed

## Troubleshooting

### 403 Forbidden Error
- Ensure you're using Hostinger's Node.js hosting, not shared hosting
- Check that all files are uploaded correctly
- Verify the `.htaccess` file is in the root directory

### 500 Internal Server Error
- Check the Node.js logs in your Hostinger control panel
- Verify all environment variables are set correctly
- Ensure all dependencies are installed

### Build Errors
- Make sure you're using Node.js version 18 or higher
- Check that all TypeScript types are correct
- Verify all imports are working

## File Structure After Deployment
```
public_html/
├── .htaccess
├── package.json
├── package-lock.json
├── .next/
├── static/
├── _next/
└── [other build files]
```

## Important Notes
- This app uses SSR, so it requires Node.js hosting
- The `.htaccess` file provides Apache configuration for security and performance
- Make sure your Hostinger plan supports Node.js applications
- The app will be served from the `output` directory as configured in `next.config.ts`

## Alternative: Static Export (If Needed)
If you need to use shared hosting without Node.js support, you would need to:
1. Convert all dynamic routes to static pages
2. Remove client-side dynamic functionality
3. Use `output: 'export'` in `next.config.ts`
4. Generate static HTML files

However, this would require significant changes to your application architecture. 