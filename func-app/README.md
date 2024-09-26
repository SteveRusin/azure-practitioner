# Azure Function App

## Overview
This repository contains an Azure Function App designed to handle product-related functionalities. It is built using TypeScript and utilizes Azure's App Configuration and Functions libraries.

## Features
- HTTP GET endpoint for retrieving a product by ID
- HTTP GET endpoint for listing all products
- Easy deployment through a Bash script

## Prerequisites
- Azure CLI installed and configured
- Node.js and npm

## File Structure
```
src/
  ├── functions/
  │   ├── http-get-product-by-id.ts
  │   ├── http-get-product-list.ts
  │   └── mock.ts
```

## Scripts
- **build**: Compiles TypeScript files.
- **build-and-deploy**: Cleans, builds, and deploys the function app.
- **copy-artifacts**: Copies necessary artifacts for deployment.
- **clean**: Removes the `dist` directory.
- **start:dev**: Builds and starts the function app in development mode.
- **build:watch**: Watches for changes in TypeScript files and recompiles.

## Example Requests

### For Local Development
To test the endpoints locally, run the following commands:
```bash
curl -v http://localhost:7071/api/products/2 
curl -v http://localhost:7071/api/products
```

### For Deployed Function
To access the deployed function, use these commands:
```bash
curl https://functionapi01.azure-api.net/azurepractitioner/products
curl https://functionapi01.azure-api.net/azurepractitioner/products/2
```

## Deployment
Run the following command to deploy your function app:
```bash
npm run build-and-deploy
```
```

