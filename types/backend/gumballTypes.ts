import z from "zod";

export const createGumballSchema = z.object({
  creatorAddress: z.string().min(1),
  id: z.number().int().gt(0),
  name: z.string().min(1).max(32),
  manualStart: z.boolean().default(false),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  totalTickets: z.number().int().gt(0),
  ticketMint: z.string().optional(),
  ticketPrice: z.string().min(1),
  isTicketSol: z.boolean().default(true),
  maxPrizes: z.number().int().gt(2).default(1000),
});


export type GumballBackendType = z.infer<typeof createGumballSchema>;