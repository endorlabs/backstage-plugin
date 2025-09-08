# Testing the Backstage Plugin

This directory contains resources for testing the Endor Labs Backstage plugin in a local Backstage environment. You can use the `setup.sh` script to install backstage and configure the Endor Labs plugins.

## Prerequisites

- Node.js (20 or later LTS version)
- Yarn

## Setup Instructions

You can use the provided setup script to automate all these steps:

```bash
./setup.sh
```

Or follow these steps manually:

### 1. Create a Backstage App

First, create a new Backstage app:

```bash
npx @backstage/create-app@latest --path backstage
```

This will create a new directory called `backstage` with a basic Backstage application.

### 2. Copy the plugins to the Backstage app folder

```bash
mkdir -p backstage/plugins/endor-frontend
mkdir -p backstage/plugins/endor-backend
rsync -a --exclude=node_modules ../endor-frontend/ backstage/plugins/endor-frontend/
rsync -a --exclude=node_modules ../endor-backend/ backstage/plugins/endor-backend/
```

### 3. Copy the overrides to the Backstage folder

```bash
cp -r overrides/packages/backend/src/index.ts backstage/packages/backend/src/index.ts
cp -r overrides/packages/app/src/App.tsx backstage/packages/app/src/App.tsx
cp -r overrides/packages/app/src/components/catalog/EntityPage.tsx backstage/packages/app/src/components/catalog/EntityPage.tsx
```

### 4. Install dependencies

Navigate to the Backstage directory and install dependencies:

```bash
cd backstage
yarn install
```

### 5. Configure the Endor Labs API

Create or update the `app-config.local.yaml` file in the backstage folder with your Endor Labs API configuration:

```yaml
endor:
  apiKey: your-api-key
  apiSecret: your-api-secret
  namespace: your-namespace
  apiUrl: https://api.endorlabs.com
```

### 6. Copy entities.yaml for catalog

Copy the entities.yaml file to the Backstage examples directory:

```bash
cp entities.yaml backstage/examples/entities.yaml
```

### 7. Start Backstage

From the Backstage directory, run:

```bash
yarn start
```

This will start the Backstage app with the Endor Labs plugin installed.

### 8. Access Backstage

Once the application is running, you can access Backstage at:

```
http://localhost:3000
```

Navigate to the catalog and select the component with Endor Labs annotations to see the plugin in action.

## Troubleshooting

- Make sure all required ports are available (3000 is used by default)
- If you have issues with dependencies, try running `yarn install` again in the Backstage directory
- Check the terminal output for any errors during startup
- It may be necessary to refresh the overrides content and re-implement the plugin changes for newer versions of Backstage
