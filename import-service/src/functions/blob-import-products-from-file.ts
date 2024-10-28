import { app, InvocationContext } from "@azure/functions";
import { parse } from "csv-parse";
import { getProductsSender, getSbClient } from "../sb_client";
import {
  getParsedContainer,
  getSASQueryParameterForFile,
  getUploadContainer,
} from "../blob-client";
import { setTimeout } from "timers/promises";

export async function blobImportProductsFromFile(
  blob: unknown,
  context: InvocationContext,
) {
  if (!(blob instanceof Buffer)) {
    return context.log("Cannot process blob parsing");
  }

  const sbClient = getSbClient();
  const sender = getProductsSender(sbClient);
  const fileName = context.triggerMetadata.name as string;

  const csv = parse(blob.toString("utf8"), {
    columns: true,
    skip_empty_lines: true,
  });

  const uploadContainer = getUploadContainer();
  const uploadBlobClient = uploadContainer.getBlockBlobClient(fileName);

  const parsedContainer = getParsedContainer();
  const parsedBlobClient = parsedContainer.getBlockBlobClient(fileName);

  csv.on("data", async (product) => {
    try {
      context.log("sending", product);
      await sender.sendMessages({
        body: product,
      });
    } catch (error) {
      context.error("cannot sent product", error);
    }
  });

  let resolve;
  let reject;

  const done = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  csv.on("end", async () => {
    context.log("Done reading file");
    context.log("Moving file from upload to parsed");

    try {
      await parsedBlobClient.syncCopyFromURL(
        `${uploadBlobClient.url}?${getSASQueryParameterForFile(fileName)}`,
      );
      await uploadBlobClient.delete();
      resolve();
    } catch (e) {
      context.log(`Failed to copy or delete origin ${fileName}`);
      context.log(e);
      reject();
    } finally {
      await setTimeout(3_000);
      await sender.close();
      await sbClient.close();
    }

    context.log("Exiting...");
  });

  return await done;
}

app.storageBlob("blob-import-products-from-file", {
  path: "upload/{name}",
  connection: "",
  handler: blobImportProductsFromFile,
});
