import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getProductById } from "../db";

import { mockedProducts } from "../mock";
import { zodMiddleware } from '../middlewares';

export async function httpGetProductById(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const productId = request.params["id"];

  context.log(`Got request for product: ${productId}`)

  if (productId == null) {
    return {
      status: 400,
      jsonBody: {
        message: `Expected product id. Got ${productId}`,
      },
    };
  }

  const product = await getProductById(productId);
  context.info(`Got product`, productId);

  if (product == null) {
    return {
      status: 404,
      jsonBody: {
        message: `Product with id: ${productId} not found`,
      },
    };
  }

  return {
    jsonBody: product,
  };
}

app.http("http-get-product-by-id", {
  route: "products/{id:guid}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: zodMiddleware(httpGetProductById),
});
