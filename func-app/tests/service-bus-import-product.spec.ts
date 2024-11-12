import { describe, it, expect, vi, beforeEach } from "vitest";
import { serviceBusQueueTrigger } from "../src/functions/service-bus-import-product"; // Adjust the import path
import { getProductsContainer, getStocksContainer } from "../src/db";
import { productSchema, Product } from "../src/models";
import { InvocationContext } from "@azure/functions";

vi.mock("../src/db", () => ({
  getProductsContainer: vi.fn(),
  getStocksContainer: vi.fn(),
}));

describe("serviceBusQueueTrigger", () => {
  const mockContext = {
    log: vi.fn(),
    info: vi.fn(),
  } as unknown as InvocationContext;
  const validMessage: Product = {
    id: "123",
    count: 10,
    price: 99,
    title: "title",
    description: "123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse the message and create product and stock entities", async () => {
    const mockProductContainer = {
      items: {
        upsert: vi.fn().mockResolvedValueOnce(validMessage),
      },
    };
    const mockStockContainer = {
      items: {
        upsert: vi.fn().mockResolvedValueOnce(validMessage),
      },
    };

    (getProductsContainer as any).mockReturnValue(mockProductContainer);
    (getStocksContainer as any).mockReturnValue(mockStockContainer);

    await serviceBusQueueTrigger(validMessage, mockContext);

    expect(mockContext.log).toHaveBeenCalledWith(
      "Incoming message ",
      validMessage,
    );
    expect(mockProductContainer.items.upsert).toHaveBeenCalledWith(validMessage);
    expect(mockContext.info).toHaveBeenCalledWith("Created product entity");

    expect(mockStockContainer.items.upsert).toHaveBeenCalledWith({
      id: validMessage.id,
      product_id: validMessage.id,
      count: validMessage.count,
    });
    expect(mockContext.info).toHaveBeenCalledWith("Created stock entity");
  });

  it("should handle errors thrown by productSchema", async () => {
    const invalidMessage = {}; // An invalid message that will fail schema validation

    await expect(
      serviceBusQueueTrigger(invalidMessage, mockContext),
    ).rejects.toThrow();

    expect(mockContext.log).toHaveBeenCalledWith(
      "Incoming message ",
      invalidMessage,
    );
  });

  it("should handle errors thrown by upsert operations", async () => {
    const mockProductContainer = {
      items: {
        upsert: vi.fn().mockRejectedValueOnce(new Error("Database error")),
      },
    };

    (getProductsContainer as any).mockReturnValue(mockProductContainer);
    (getStocksContainer as any).mockReturnValue({ items: { upsert: vi.fn() } });

    await expect(
      serviceBusQueueTrigger(validMessage, mockContext),
    ).rejects.toThrow("Database error");
    expect(mockContext.info).not.toHaveBeenCalled(); // Ensure that info logs weren't called
  });
});
