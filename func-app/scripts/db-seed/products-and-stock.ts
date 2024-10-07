import { CosmosClient, OperationInput } from "@azure/cosmos";
import { faker } from "@faker-js/faker";
import { DefaultAzureCredential } from "@azure/identity";
import { Product, Stock } from "src/models";

import { productsContainer, stocksContainer } from "src/db";

function generateRandomProduct(id: string): Product {
  return {
    id,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
  };
}

function generateRandomStock(productId: string): Stock {
  return {
    product_id: productId,
    count: faker.number.int({ min: 1, max: 10 }),
  };
}

export async function seed() {
  const productsAmount = 10;
  const productsIds = Array.from({ length: productsAmount }).map(() =>
    faker.string.uuid(),
  );
  const productsOperations: OperationInput[] = productsIds.map((id) => {
    return {
      operationType: "Upsert",
      resourceBody: generateRandomProduct(id),
    };
  });
  const stockOperations: OperationInput[] = productsIds.map((id) => {
    return {
      operationType: "Upsert",
      resourceBody: generateRandomStock(id),
    };
  });


  await productsContainer.items.bulk(productsOperations);
  await stocksContainer.items.bulk(stockOperations);
}
