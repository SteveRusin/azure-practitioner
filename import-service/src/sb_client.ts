import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";

export function getSbClient() {
  const connectionString = process.env.SB_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error("SB_CONNECTION_STRING is not defined");
  }

  return new ServiceBusClient(connectionString);
}

export function getProductsSender(client: ServiceBusClient) {
  const topicOrQueue = process.env.SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE;

  if (!topicOrQueue) {
    throw new Error("SB_PRODUCTS_IMPORT_TOPIC_OR_QUEUE is not defined");
  }

  return client.createSender(topicOrQueue);
}
