import { HttpHandler } from "@azure/functions";
import { ZodError } from "zod";

export function zodMiddleware(handler: HttpHandler): HttpHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      context.log(err);
      if (!(err instanceof ZodError)) {
        throw err;
      }

      return {
        status: 422,
        jsonBody: err.format(),
      };
    }
  };
}
