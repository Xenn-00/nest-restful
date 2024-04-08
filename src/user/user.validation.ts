import { ZodType, z } from 'zod';

export class UserValidation {
  static readonly UPDATE: ZodType = z.object({
    username: z.string().min(1).max(100).optional(),
    password: z.string().min(8).optional(),
    confirmPassword: z.string().min(8).optional(),
    name: z.string().min(1).optional(),
  });
}
