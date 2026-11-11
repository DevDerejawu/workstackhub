import { ZodSchema } from "zod";
export const catchAsync = (fn: Function) => {
  return (req: Req, res: Res, next: Nex) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export function validateRequest(
  schema: ZodSchema,
  type: "query" | "body" | "params",
) {
  return catchAsync(async (req: Req, _: Res, next: Nex) => {
    // 1. Process validation type without calling next() early
    if (type === "body" && req.body && Object.keys(req.body).length > 0) {
      req.body = await schema.parseAsync(req.body);
    }
    
    if (type === "query" && req.query && Object.keys(req.query).length > 0) {
      req.validatedQuery = await schema.parseAsync(req.query);
    }
    
    if (type === "params" && req.params && Object.keys(req.params).length > 0) {
      req.validatedParams = await schema.parseAsync(req.params);
    }

    next();
  });
}

