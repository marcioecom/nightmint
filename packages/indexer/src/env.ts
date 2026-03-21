import { z } from "zod";

const envSchema = z.object({
  PONDER_CHAIN: z.enum(["anvil", "sepolia"]).default("anvil"),
  PONDER_RPC_URL: z.string().url().optional(),
  PONDER_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional() as z.ZodType<`0x${string}` | undefined>,
  PONDER_START_BLOCK: z.coerce.number().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
