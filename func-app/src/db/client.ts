import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient, Database } from "@azure/cosmos";

const credential = new DefaultAzureCredential();

let client: CosmosClient;

function getClient() {
  if (client) {
    return client;
  }
  client = new CosmosClient({
    endpoint: process.env["DB_URI"],
    aadCredentials: credential,
  });

  return client;
}

let db: Database;

export function getDb() {
  if (db) {
    return db;
  }

  return (db = getClient().database(process.env["DB_NAME"]));
}

export function getProductsContainer() {
  return getDb().container("products");
}

export function getStocksContainer() {
  return getDb().container("stock");
}
