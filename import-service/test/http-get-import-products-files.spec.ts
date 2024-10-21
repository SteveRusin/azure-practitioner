import { describe, it, expect, vi, beforeEach } from "vitest";
import { getImportProductsFiles } from "../src/functions/http-get-import-products-files";
import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  getUploadContainer,
  getSASQueryParameterForFile,
} from "../src/blob-client";

vi.mock("../src/blob-client", () => ({
  getUploadContainer: vi.fn(),
  getSASQueryParameterForFile: vi.fn(),
}));

describe("getImportProductsFiles", () => {
  const logMock = vi.fn();
  const context: InvocationContext = {
    log: logMock,
  } as any;

  const containerClientMock = {
    getBlockBlobClient: vi.fn(),
  };
  const blobClientMock = {
    url: "https://example.com/blob-url",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getUploadContainer as any).mockReturnValue(containerClientMock);
    containerClientMock.getBlockBlobClient.mockReturnValue(blobClientMock);
    (getSASQueryParameterForFile as any).mockReturnValue("sas-token");
  });

  it("should return 400 when no file name is provided", async () => {
    const request: HttpRequest = {
      query: new Map(),
    } as any;

    const result = await getImportProductsFiles(request, context);

    expect(result.status).toBe(400);
    expect(result.jsonBody).toEqual({
      message: "No file name provided in ?name query parameter",
    });
    expect(logMock).toHaveBeenCalledWith("got request for file: ", undefined);
  });

  it("should return a full URL when file name is provided", async () => {
    const request: HttpRequest = {
      query: new Map([["name", "test-file.txt"]]),
    } as any;

    const result = await getImportProductsFiles(request, context);

    expect(result.jsonBody).toBe("https://example.com/blob-url?sas-token");
    expect(logMock).toHaveBeenCalledWith(
      "got request for file: ",
      "test-file.txt",
    );
    expect(getUploadContainer).toHaveBeenCalled();
    expect(containerClientMock.getBlockBlobClient).toHaveBeenCalledWith(
      "test-file.txt",
    );
    expect(getSASQueryParameterForFile).toHaveBeenCalledWith("test-file.txt");
  });
});
