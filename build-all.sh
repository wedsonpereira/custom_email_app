#!/bin/bash

echo "🚀 Building Enquiry Application for Production"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build Backend
echo -e "${BLUE}📦 Building Backend...${NC}"
cd backend/emaildataview
mvn clean package -DskipTests

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build successful!${NC}"
    echo "   JAR location: backend/emaildataview/target/emaildataview-0.0.1-SNAPSHOT.jar"
else
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi

echo ""

# Build Frontend
echo -e "${BLUE}🎨 Building Frontend...${NC}"
cd ../../Frontend
npm install
npm run build:prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful!${NC}"
    echo "   Build location: Frontend/dist/"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All builds completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Upload backend/emaildataview/target/emaildataview-0.0.1-SNAPSHOT.jar to server"
echo "2. Upload Frontend/dist/* to public_html/"
echo "3. Run ./start-production.sh on server"
echo ""
echo "📖 See PRODUCTION_GUIDE.md for detailed instructions"
