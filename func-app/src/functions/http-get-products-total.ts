import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { getStocksContainer } from "../db";

import { zodMiddleware } from "../middlewares";

export async function productsTotal(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  context.log(`Got request for products total`);

  const result = await getStocksContainer().items
    .query("SELECT SUM(c.count) AS totalCount FROM c")
    .fetchAll();

  return {
    jsonBody: {
      total: result.resources[0]?.totalCount,
    },
  };
}

app.http("http-get-products-total", {
  route: "products/total",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: zodMiddleware(productsTotal),
});
