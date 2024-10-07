import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient } from "@azure/cosmos";

const credential = new DefaultAzureCredential();

const client = new CosmosClient({
  endpoint: process.env['DB_URI'],
  aadCredentials: credential,
});

export const db = client.database(process.env['DB_NAME']);
export const productsContainer = db.container('products');
export const stocksContainer = db.container('stock');

