import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { mockedProducts } from "../mock";

export async function httpGetProductList(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Got request for GET products`);

  return {
    jsonBody: mockedProducts,
  };
}

app.http("http-get-product-list", {
  methods: ["GET"],
  route: "products",
  authLevel: "anonymous",
  handler: httpGetProductList,
});
