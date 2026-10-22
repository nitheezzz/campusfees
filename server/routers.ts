import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const feeFields = {
  studentName: z.string().trim().min(1, "Student name is required").max(150),
  rollNumber: z.string().trim().min(1, "Roll number is required").max(80),
  course: z.string().trim().min(1, "Course is required").max(150),
  amount: z
    .number()
    .finite()
    .positive("Fee amount must be greater than zero")
    .max(9_999_999_999.99)
    .refine(value => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001, "Fee amount may have at most two decimal places"),
  status: z.enum(["Paid", "Pending"]),
};

const feeInput = z.object(feeFields).strict();
const recordId = z.object({ id: z.number().int().positive() }).strict();

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  feeRecords: router({
    // The owner explicitly chose a public roster: this exposes every listed field to visitors.
    list: publicProcedure.query(() => db.listFeeRecords()),
    // New submissions are intentionally anonymous and self-reported; this is not payment verification.
    create: publicProcedure.input(feeInput).mutation(async ({ input }) => {
      await db.createFeeRecord({
        ...input,
        amount: input.amount.toFixed(2),
      });
      return { success: true } as const;
    }),
    // The public ledger allows any visitor to edit an existing self-reported entry.
    update: publicProcedure
      .input(recordId.extend(feeFields).strict())
      .mutation(async ({ input }) => {
        const { id, ...fields } = input;
        await db.updateFeeRecord(id, {
          ...fields,
          amount: fields.amount.toFixed(2),
        });
        return { success: true } as const;
      }),
    // The public ledger allows any visitor to delete an existing entry.
    delete: publicProcedure.input(recordId).mutation(async ({ input }) => {
      await db.deleteFeeRecord(input.id);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
