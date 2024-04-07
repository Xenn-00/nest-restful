import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly SIGNUP: ZodType = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(8).max(256),
    name: z.string().min(1).max(256),
  });

  static readonly SIGNIN: ZodType = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });
}
