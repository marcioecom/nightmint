import { z } from "zod";

const envSchema = z.object({
  PONDER_RPC_URL: z.string().url(),
  PONDER_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/) as z.ZodType<`0x${string}`>,
  PONDER_CHAIN_ID: z.coerce.number().default(11155111),
  PONDER_START_BLOCK: z.coerce.number().default(0),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables.");
}

export const env = _env.data;
