import { describe, it, expect, vi, beforeEach } from "vitest";
import { blobImportProductsFromFile } from "../src/functions/blob-import-products-from-file";
import { getProductsSender, getSbClient } from "../src/sb_client";
import {
  getParsedContainer,
  getUploadContainer,
  getSASQueryParameterForFile,
} from "../src/blob-client";
import { InvocationContext } from "@azure/functions";

vi.mock("../src/sb_client", () => ({
  getSbClient: vi.fn(),
  getProductsSender: vi.fn(),
}));

vi.mock("../src/blob-client", () => ({
  getParsedContainer: vi.fn(),
  getUploadContainer: vi.fn(),
  getSASQueryParameterForFile: vi.fn(),
}));

describe("blobImportProductsFromFile", () => {
  const mockContext = {
    log: vi.fn(),
    error: vi.fn(),
    triggerMetadata: {
      name: "test-file.csv",
    },
  } as undefined as InvocationContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process the blob and send messages", async () => {
    const mockBlob = Buffer.from("name,count\nProduct1,10\nProduct2,20");
    const mockSbClient = { close: vi.fn() };
    const mockSender = {
      sendMessages: vi.fn().mockResolvedValueOnce(undefined),
      close: vi.fn(),
    };

    const mockUploadContainer = {
      getBlockBlobClient: vi.fn().mockReturnValue({
        delete: vi.fn(),
        url: "https://example.com/upload/test-file.csv",
      }),
    };
    const mockParsedContainer = {
      getBlockBlobClient: vi.fn().mockReturnValue({
        syncCopyFromURL: vi.fn(),
      }),
    };

    (getSbClient as any).mockReturnValue(mockSbClient);
    (getProductsSender as any).mockReturnValue(mockSender);
    (getUploadContainer as any).mockReturnValue(mockUploadContainer);
    (getParsedContainer as any).mockReturnValue(mockParsedContainer);
    (getSASQueryParameterForFile as any).mockReturnValue("sas-token");

    await blobImportProductsFromFile(mockBlob, mockContext);

    expect(mockContext.log).toHaveBeenCalledWith("Done reading file");
    expect(mockSender.sendMessages).toHaveBeenCalledTimes(2);
    expect(mockSender.sendMessages).toHaveBeenCalledWith({
      body: { name: "Product1", count: "10" },
    });
    expect(mockSender.sendMessages).toHaveBeenCalledWith({
      body: { name: "Product2", count: "20" },
    });

    expect(mockParsedContainer.getBlockBlobClient).toHaveBeenCalledWith(
      "test-file.csv",
    );
    expect(mockUploadContainer.getBlockBlobClient).toHaveBeenCalledWith(
      "test-file.csv",
    );
    expect(mockUploadContainer.getBlockBlobClient().delete).toHaveBeenCalled();
    expect(
      mockParsedContainer.getBlockBlobClient().syncCopyFromURL,
    ).toHaveBeenCalledWith(
      `https://example.com/upload/test-file.csv?sas-token`,
    );
  });

  it("should log error when blob is not a Buffer", async () => {
    const invalidBlob = "invalid blob";
    await blobImportProductsFromFile(invalidBlob, mockContext);

    expect(mockContext.log).toHaveBeenCalledWith("Cannot process blob parsing");
  });

  it("should handle errors during message sending", async () => {
    const mockBlob = Buffer.from("name,count\nProduct1,10");
    const mockSender = {
      sendMessages: vi.fn().mockRejectedValueOnce(new Error("Send failed")),
      close: vi.fn(),
    };

    (getProductsSender as any).mockReturnValue(mockSender);

    await blobImportProductsFromFile(mockBlob, mockContext);

    expect(mockContext.error).toHaveBeenCalledWith(
      "cannot sent product",
      expect.any(Error),
    );
  });
});
