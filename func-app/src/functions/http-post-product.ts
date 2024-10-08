import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { randomUUID } from "crypto";

import {
  Product,
  productDtoSchema,
  ProductEntity,
  StockEntity,
} from "../models";
import { zodMiddleware } from "../middlewares";
import { productsContainer, stocksContainer } from "../db";

export async function httpPostProduct(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const body = await request.json();
  context.info(`Got POST products with body: `, body);
  const productDto = productDtoSchema.parse(body);
  const id = randomUUID();
  const product: ProductEntity = {
    id,
    price: productDto.price,
    title: productDto.title,
    description: productDto.description,
  };

  await productsContainer.items.upsert(product);
  context.info("Created product entity");

  const stock: StockEntity = {
    id,
    product_id: id,
    count: productDto.count,
  };

  await stocksContainer.items.upsert(stock);
  context.info("Created stock entity");

  return {
    status: 201,
    jsonBody: {
      ...product,
      count: productDto.count,
    },
  };
}

app.http("http-post-product", {
  route: "products",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: zodMiddleware(httpPostProduct),
});
