import { ErrorHandler } from "hono";

const handler: ErrorHandler = (err, c) => {
  console.error(err);
  return c.json(
    {
      success: false,
      error: err.message || "Internal server error",
    },
    500
  );
};

export default handler;
