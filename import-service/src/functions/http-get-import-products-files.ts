import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import {
  getSharedKeyCredentials,
  getUploadContainer,
  getSASQueryParameterForFile,
} from "../blob-client";

export async function getImportProductsFiles(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const fileName = request.query.get("name");

  context.log("got request for file: ", fileName);

  if (!fileName) {
    return {
      status: 400,
      jsonBody: {
        message: "No file name provided in ?name query parameter",
      },
    };
  }

  const containerClient = getUploadContainer();
  const blobClient = containerClient.getBlockBlobClient(fileName);

  const fullUrl = `${blobClient.url}?${getSASQueryParameterForFile(fileName)}`;

  return { jsonBody: fullUrl };
}

app.http("http-get-import-products-files", {
  route: "import",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getImportProductsFiles,
});
