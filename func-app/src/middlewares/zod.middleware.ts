import { HttpHandler } from "@azure/functions";
import { ZodError } from "zod";

export function zodMiddleware(handler: HttpHandler): HttpHandler {
  return async (request, context) => {
    try {
      return handler(request, context);
    } catch (err) {
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
