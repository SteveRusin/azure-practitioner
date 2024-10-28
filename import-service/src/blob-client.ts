import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

let blobServiceClient: BlobServiceClient;
let sharedKeyCredential: StorageSharedKeyCredential;

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const storageKey = process.env.AZURE_STORAGE_KEY;

export function getSharedKeyCredentials() {
  if (!accountName || !storageKey) {
    throw Error("Azure Storage accountName or key not found");
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    storageKey,
  );

  return sharedKeyCredential;
}

export function getBlobClient() {
  if (blobServiceClient) {
    return blobServiceClient;
  }

  if (!accountName || !storageKey) {
    throw Error("Azure Storage accountName or key not found");
  }

  blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    getSharedKeyCredentials(),
  );

  return blobServiceClient;
}

export function getUploadContainer() {
  return getBlobClient().getContainerClient("upload");
}

export function getParsedContainer() {
  return getBlobClient().getContainerClient("parsed");
}

export function getSASQueryParameterForFile(fileName: string) {
  const blobSASPermissions = new BlobSASPermissions();
  blobSASPermissions.write = true;
  blobSASPermissions.create = true;
  blobSASPermissions.add = true;
  blobSASPermissions.read = true;

  const now = new Date();
  const futureDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes in future
  const blobSASQueryString = generateBlobSASQueryParameters(
    {
      containerName: "upload",
      expiresOn: futureDate,
      blobName: fileName,
      permissions: blobSASPermissions,
    },
    getSharedKeyCredentials(),
  ).toString();

  return blobSASQueryString;
}
