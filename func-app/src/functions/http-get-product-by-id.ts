import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;

import { mockedProducts } from "../mock";

export async function httpGetProductById(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const productId = request.params["id"];

  if (productId == null) {
    return {
      status: 400,
      jsonBody: {
        message: `Expected product id. Got ${productId}`,
      },
    };
  }

  const product = mockedProducts.find((product) => product.id === productId);

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
  route: "products/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: httpGetProductById,
});
