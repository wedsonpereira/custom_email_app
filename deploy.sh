#!/bin/bash

# Production Build and Deploy Script for enquiry.thumbeja.com
# This script builds the frontend for production

echo "🚀 Starting production build..."

# Navigate to Frontend directory
cd Frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Built files are in: Frontend/dist/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload all files from Frontend/dist/ to: enquiry.thumbeja.com/"
    echo "2. Upload your Spring Boot app to: enquiry.thumbeja.com/spring/"
    echo "3. Ensure .htaccess is uploaded for React Router support"
    echo ""
    echo "🔗 Production API URL: https://enquiry.thumbeja.com/spring"
    echo ""
    echo "For detailed deployment instructions, see DEPLOYMENT.md"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
