import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { mockedProducts } from "../mock";
import { getAllProducts } from "../db";
import { zodMiddleware } from "../middlewares";

export async function httpGetProductList(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Got request for GET products`);
  const products = await getAllProducts();
  context.info("Received next products", products);

  return {
    jsonBody: products,
  };
}

app.http("http-get-product-list", {
  methods: ["GET"],
  route: "products",
  authLevel: "anonymous",
  handler: zodMiddleware(httpGetProductList),
});
