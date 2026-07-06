import { z } from "zod";
import { passwordSchema } from "@/lib/validation/auth";

export const THEME_OPTIONS = ["LIGHT", "DARK", "SYSTEM"] as const;
export const VISIBILITY_OPTIONS = ["PUBLIC", "FOLLOWERS", "PRIVATE"] as const;

export const updateSettingsSchema = z.object({
  theme: z.enum(THEME_OPTIONS).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  profileVisibility: z.enum(VISIBILITY_OPTIONS).optional(),
  showLocation: z.boolean().optional(),
  showStats: z.boolean().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changeEmailSchema = z.object({
  newEmail: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
