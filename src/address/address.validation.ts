import { ZodType, z } from 'zod';

export class AddressValidation {
  static readonly CREATE: ZodType = z.object({
    street: z.string().min(1).max(256).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100),
    postal_code: z.string().min(1).max(10),
  });

  static readonly UPDATE: ZodType = z.object({
    street: z.string().min(1).max(256).optional(),
    city: z.string().min(1).max(100).optional(),
    province: z.string().min(1).max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    postal_code: z.string().min(1).max(10).optional(),
  });
}
