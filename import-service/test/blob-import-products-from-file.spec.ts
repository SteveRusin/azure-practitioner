import { describe, it, expect, vi, beforeEach } from "vitest";
import { blobImportProductsFromFile } from "../src/functions/blob-import-products-from-file";
import { parse } from "csv-parse";
import { InvocationContext } from "@azure/functions";
import {
  getUploadContainer,
  getParsedContainer,
  getSASQueryParameterForFile,
} from "../src/blob-client";

vi.mock("csv-parse", () => ({
  parse: vi.fn(),
}));

vi.mock("../src/blob-client", () => ({
  getUploadContainer: vi.fn(),
  getParsedContainer: vi.fn(),
  getSASQueryParameterForFile: vi.fn(),
}));

describe("blobImportProductsFromFile", () => {
  const logMock = vi.fn();
  const context: InvocationContext = {
    log: logMock,
    triggerMetadata: {
      name: "test-file.csv",
    },
  } as any;

  const uploadBlobClientMock = {
    url: "https://example.com/upload-blob-url",
    delete: vi.fn(),
  };

  const parsedBlobClientMock = {
    syncCopyFromURL: vi.fn(),
  };

  const uploadContainerMock = {
    getBlockBlobClient: vi.fn(),
  };

  const parsedContainerMock = {
    getBlockBlobClient: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (getUploadContainer as any).mockReturnValue(uploadContainerMock);
    (getParsedContainer as any).mockReturnValue(parsedContainerMock);

    uploadContainerMock.getBlockBlobClient.mockReturnValue(
      uploadBlobClientMock,
    );
    parsedContainerMock.getBlockBlobClient.mockReturnValue(
      parsedBlobClientMock,
    );
  });

  it("should log and return if blob is not a Buffer", async () => {
    await blobImportProductsFromFile("not-a-buffer", context);

    expect(logMock).toHaveBeenCalledWith("Cannot process blob parsing");
  });

  it("should parse the CSV and log each product", async () => {
    const blob = Buffer.from("id,name\n1,Product1\n2,Product2");
    const csvMock = { on: vi.fn() };

    (parse as any).mockReturnValue(csvMock);

    csvMock.on.mockImplementation((event, handler) => {
      if (event === "data") {
        handler({ id: 1, name: "Product1" });
        handler({ id: 2, name: "Product2" });
      }
      if (event === "end") {
        handler();
      }
    });

    const promise = blobImportProductsFromFile(blob, context);

    await promise;

    expect(parse).toHaveBeenCalledWith(blob.toString("utf8"), {
      columns: true,
      skip_empty_lines: true,
    });
    expect(logMock).toHaveBeenCalledWith("Reading product ", {
      id: 1,
      name: "Product1",
    });
    expect(logMock).toHaveBeenCalledWith("Reading product ", {
      id: 2,
      name: "Product2",
    });
  });

  it("should move the file from upload to parsed and delete the original", async () => {
    const blob = Buffer.from("id,name\n1,Product1");
    const csvMock = { on: vi.fn() };

    (parse as any).mockReturnValue(csvMock);

    csvMock.on.mockImplementation((event, handler) => {
      if (event === "end") {
        handler();
      }
    });

    (getSASQueryParameterForFile as any).mockReturnValue("sas-token");

    await blobImportProductsFromFile(blob, context);

    expect(logMock).toHaveBeenCalledWith("Done reading file");
    expect(logMock).toHaveBeenCalledWith("Moving file from upload to parsed");

    expect(parsedBlobClientMock.syncCopyFromURL).toHaveBeenCalledWith(
      "https://example.com/upload-blob-url?sas-token",
    );
    expect(uploadBlobClientMock.delete).toHaveBeenCalled();
  });

  it("should log error if file copy or delete fails", async () => {
    const blob = Buffer.from("id,name\n1,Product1");
    const csvMock = { on: vi.fn() };

    (parse as any).mockReturnValue(csvMock);

    csvMock.on.mockImplementation((event, handler) => {
      if (event === "end") {
        handler();
      }
    });

    (getSASQueryParameterForFile as any).mockReturnValue("sas-token");

    parsedBlobClientMock.syncCopyFromURL.mockRejectedValue(
      new Error("Copy failed"),
    );

    const promise = blobImportProductsFromFile(blob, context);

    await expect(promise).rejects.toThrow();

    expect(logMock).toHaveBeenCalledWith(
      "Failed to copy or delete origin test-file.csv",
    );
    expect(logMock).toHaveBeenCalledWith(new Error("Copy failed"));
  });
});
