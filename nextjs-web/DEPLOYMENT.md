# Hostinger Deployment Guide

## Overview
This Next.js application is configured for deployment on Hostinger with a custom output directory.

## Build Configuration
- **Output Directory**: `./output`
- **Build Command**: `npm run build`
- **Static Files**: Located in `./output/static/`

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Upload to Hostinger
1. Log into your Hostinger control panel
2. Navigate to File Manager
3. Upload the contents of the `output` directory to your `public_html` folder

### 3. File Structure on Hostinger
```
public_html/
├── .htaccess
├── static/
│   ├── chunks/
│   ├── css/
│   ├── media/
│   └── [hash]/
├── server/
│   ├── app/
│   ├── pages/
│   └── chunks/
└── [other build files]
```

### 4. .htaccess Configuration
The `.htaccess` file is already included in the `output` directory and contains:
- URL rewriting for client-side routing
- Security headers
- Compression settings
- Browser caching rules
- 404 error handling

### 5. Environment Variables
Make sure to set the following environment variables in your Hostinger hosting:
- `NEXT_PUBLIC_API_URL`: Your backend API URL

### 6. Domain Configuration
- Point your domain to the `public_html` directory
- Ensure SSL is enabled for HTTPS

## Features Included
- ✅ Custom output directory (`./output`)
- ✅ .htaccess for Apache server
- ✅ Security headers
- ✅ Compression and caching
- ✅ Client-side routing support
- ✅ 404 error handling
- ✅ HTTPS redirect (commented out - uncomment if SSL is enabled)

## Troubleshooting

### Common Issues
1. **404 Errors**: Ensure the `.htaccess` file is uploaded correctly
2. **Routing Issues**: Check that URL rewriting is enabled on your hosting
3. **API Errors**: Verify your `NEXT_PUBLIC_API_URL` environment variable

### Support
If you encounter issues:
1. Check the Hostinger error logs
2. Verify all files are uploaded correctly
3. Ensure the `.htaccess` file is in the root directory

## Performance Optimization
The build includes:
- Code splitting and lazy loading
- Optimized images (unoptimized for static export)
- Compressed assets
- Browser caching rules
- Security headers for protection 