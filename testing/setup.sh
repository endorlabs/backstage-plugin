#!/bin/bash

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Setting up Endor Labs Backstage Plugin ===${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}Node.js version 20 or later is required. Current version: $(node -v)${NC}"
    exit 1
fi

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}Yarn is not installed. Please install Yarn first.${NC}"
    exit 1
fi

echo -e "${GREEN}All prerequisites are met!${NC}"

# Create a directory for the setup
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKSTAGE_DIR="$SCRIPT_DIR/backstage"

# Step 1: Create a Backstage App
echo -e "${YELLOW}Step 1: Creating a new Backstage app...${NC}"
if [ -d "$BACKSTAGE_DIR" ]; then
    echo -e "${YELLOW}Backstage directory already exists. Skipping creation.${NC}"
else
    npx @backstage/create-app@latest --path "$BACKSTAGE_DIR"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create Backstage app.${NC}"
        exit 1
    fi
fi

# Step 2: Copy the plugins to the backstage app folder
echo -e "${YELLOW}Step 2: Copying plugins to the Backstage app folder...${NC}"
mkdir -p "$BACKSTAGE_DIR/plugins/endor-frontend"
mkdir -p "$BACKSTAGE_DIR/plugins/endor-backend"
rsync -a --exclude=node_modules "$SCRIPT_DIR/../endor-frontend/" "$BACKSTAGE_DIR/plugins/endor-frontend/"
rsync -a --exclude=node_modules "$SCRIPT_DIR/../endor-backend/" "$BACKSTAGE_DIR/plugins/endor-backend/"

# Step 3: Copy the overrides to the backstage folder
echo -e "${YELLOW}Step 3: Copying overrides to the Backstage folder...${NC}"
cp -r "$SCRIPT_DIR/overrides/packages/backend/src/index.ts" "$BACKSTAGE_DIR/packages/backend/src/index.ts"
cp -r "$SCRIPT_DIR/overrides/packages/app/src/App.tsx" "$BACKSTAGE_DIR/packages/app/src/App.tsx"
cp -r "$SCRIPT_DIR/overrides/packages/app/src/components/catalog/EntityPage.tsx" "$BACKSTAGE_DIR/packages/app/src/components/catalog/EntityPage.tsx"

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
cd "$BACKSTAGE_DIR"
yarn install

# Step 5: Configure the Endor Labs API
echo -e "${YELLOW}Step 5: Creating app-config.local.yaml with Endor configuration...${NC}"
if [ -f "$SCRIPT_DIR/app-config.local.yaml" ]; then
    echo -e "${YELLOW}Copying existing app-config.local.yaml...${NC}"
    cp "$SCRIPT_DIR/app-config.local.yaml" "$BACKSTAGE_DIR/app-config.local.yaml"
else
    cat > "$BACKSTAGE_DIR/app-config.local.yaml" << 'EOL'
# Use this file for local development overrides
endor:
  apiKey: your-api-key
  apiSecret: your-api-secret
  namespace: your-namespace
  apiUrl: https://api.endorlabs.com
EOL
    echo -e "${YELLOW}Created app-config.local.yaml with example Endor Labs configuration.${NC}"
    echo -e "${YELLOW}Please update the file with your actual Endor Labs credentials.${NC}"
fi

# Step 6: Copy entities.yaml for catalog
echo -e "${YELLOW}Step 6: Copying entities.yaml to the Backstage app...${NC}"
mkdir -p "$BACKSTAGE_DIR/examples"
cp "$SCRIPT_DIR/entities.yaml" "$BACKSTAGE_DIR/examples/entities.yaml"


# Step 7: Start Backstage and open browser
echo -e "${GREEN}Setup complete! Starting Backstage...${NC}"

# Start Backstage
echo -e "${YELLOW}Running Backstage...${NC}"
cd "$BACKSTAGE_DIR" && yarn start

open http://localhost:3000
echo -e "${GREEN}=== Setup completed successfully ===${NC}" 