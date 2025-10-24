import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export const successResponse = <T>(
  c: Context,
  data: T,
  status: ContentfulStatusCode = 200
) => {
  return c.json(
    {
      success: true,
      data,
    },
    { status }
  );
};

export const errorResponse = (
  c: Context,
  error: string,
  status: ContentfulStatusCode = 400
) => {
  return c.json(
    {
      success: false,
      error,
    },
    { status }
  );
};
