import { app, InvocationContext } from "@azure/functions";
import { productSchema, StockEntity } from "../models";
import { getProductsContainer, getStocksContainer } from "../db";

export async function serviceBusQueueTrigger(
  message: unknown,
  context: InvocationContext,
): Promise<void> {
  context.log("Incoming message ", message);
  const product = productSchema.parse(message);

  await getProductsContainer().items.upsert(product);
  context.info("Created product entity");

  const stock: StockEntity = {
    id: product.id,
    product_id: product.id,
    count: product.count,
  };

  await getStocksContainer().items.upsert(stock);
  context.info("Created stock entity");
}

app.serviceBusQueue("service-bus-import-product", {
  connection: "SB_CONNECTION_STRING",
  queueName: process.env.SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE,
  handler: serviceBusQueueTrigger,
});
