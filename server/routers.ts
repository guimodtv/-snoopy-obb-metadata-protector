import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getDb,
  getUserByEmail,
  getUserById,
  getShortLinkByCode,
  getUserShortLinks,
  getSettings,
  initializeSettings,
  updateSettings,
  createClick,
  getClicksByLinkAndIp,
  createWithdrawal,
  getUserWithdrawals,
  getPendingWithdrawals,
  updateWithdrawal,
  createReferral,
  getReferralsByReferrer,
  logFraudAttempt,
  getAllUsers,
  getAllShortLinks,
  getAllClicks,
  getSystemStats,
  getUserByApiKey,
} from "./db";
import {
  generateShortCode,
  generateReferralCode,
  generateApiKey,
  calculateEarningsPerClick,
  calculateReferralCommission,
  isValidUrl,
  isBotUserAgent,
  extractClientIp,
  hashPassword,
  verifyPassword,
  isValidEmail,
  isStrongPassword,
} from "./utils";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    registerWithEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(2),
          referralCode: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Validar email e senha
        if (!isValidEmail(input.email)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email inválido",
          });
        }

        if (!isStrongPassword(input.password)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        // Verificar se email já existe
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email já cadastrado",
          });
        }

        // Hash da senha
        const passwordHash = await hashPassword(input.password);

        // Gerar código de referência
        const referralCode = generateReferralCode();

        // Processar referral se fornecido
        let referrerId: number | null = null;
        if (input.referralCode) {
          const referrer = await db
            .select()
            .from(require("../drizzle/schema").users)
            .where(
              require("drizzle-orm").eq(
                require("../drizzle/schema").users.referralCode,
                input.referralCode
              )
            )
            .limit(1);

          if (referrer.length > 0) {
            referrerId = referrer[0].id;
          }
        }

        // Criar usuário
        const result = await db
          .insert(require("../drizzle/schema").users)
          .values({
            openId: `email_${Date.now()}_${Math.random()}`,
            email: input.email,
            name: input.name,
            passwordHash,
            loginMethod: "email",
            referralCode,
            referrerId,
            role: "user",
          });

        return {
          success: true,
          message: "Cadastro realizado com sucesso",
        };
      }),

    loginWithEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha incorretos",
          });
        }

        const isValid = await verifyPassword(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Email ou senha incorretos",
          });
        }

        return {
          success: true,
          user,
        };
      }),
  }),

  links: router({
    create: protectedProcedure
      .input(
        z.object({
          originalUrl: z.string().url(),
          title: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!isValidUrl(input.originalUrl)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "URL inválida",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const shortCode = generateShortCode();

        const result = await db
          .insert(require("../drizzle/schema").shortLinks)
          .values({
            userId: ctx.user!.id,
            originalUrl: input.originalUrl,
            shortCode,
            title: input.title,
            description: input.description,
          });

        return {
          shortCode,
          shortUrl: `/r/${shortCode}`,
          message: "Link criado com sucesso",
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserShortLinks(ctx.user!.id);
    }),

    getStats: protectedProcedure
      .input(z.object({ shortCode: z.string() }))
      .query(async ({ ctx, input }) => {
        const link = await getShortLinkByCode(input.shortCode);
        if (!link || link.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return link;
      }),

    delete: protectedProcedure
      .input(z.object({ shortCode: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const link = await getShortLinkByCode(input.shortCode);
        if (!link || link.userId !== ctx.user!.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await db
          .update(require("../drizzle/schema").shortLinks)
          .set({ isActive: false })
          .where(
            require("drizzle-orm").eq(
              require("../drizzle/schema").shortLinks.id,
              link.id
            )
          );

        return { success: true };
      }),
  }),

  clicks: router({
    record: publicProcedure
      .input(
        z.object({
          shortCode: z.string(),
          userAgent: z.string().optional(),
          referrer: z.string().optional(),
          ipAddress: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const link = await getShortLinkByCode(input.shortCode);
        if (!link || !link.isActive) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Inicializar settings
        await initializeSettings();
        const settings = await getSettings();
        if (!settings) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        // Anti-fraude: verificar cliques por IP
        let isValid = true;
        let fraudReason = "";

        // Detectar bot
        if (isBotUserAgent(input.userAgent)) {
          isValid = false;
          fraudReason = "Bot detected";
          await logFraudAttempt({
            linkId: link.id,
            userId: link.userId,
            ipAddress: input.ipAddress,
            fraudType: "bot_detected",
            details: input.userAgent,
          });
        }

        // Verificar limite de cliques por IP por hora
        if (isValid) {
          const recentClicks = await getClicksByLinkAndIp(
            link.id,
            input.ipAddress,
            1
          );
          if (recentClicks.length >= settings.maxClicksPerIpPerHour) {
            isValid = false;
            fraudReason = "Too many clicks from same IP";
            await logFraudAttempt({
              linkId: link.id,
              userId: link.userId,
              ipAddress: input.ipAddress,
              fraudType: "multiple_clicks_same_ip",
              details: `${recentClicks.length} clicks in last hour`,
            });
          }
        }

        // Calcular ganho
        const earningsPerClick = calculateEarningsPerClick(parseFloat(settings.cpm.toString()));
        const earningsGenerated = isValid ? earningsPerClick : 0;

        // Registrar clique
        await createClick({
          linkId: link.id,
          userId: link.userId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          referrer: input.referrer,
          isValid,
          fraudReason: fraudReason || undefined,
          earningsGenerated: earningsGenerated.toString(),
        });

        // Atualizar estatísticas do link
        if (isValid) {
          await db
            .update(require("../drizzle/schema").shortLinks)
            .set({
              clicks: link.clicks + 1,
              validClicks: link.validClicks + 1,
              earnings: (
                parseFloat(link.earnings.toString()) + earningsGenerated
              ).toString(),
            })
            .where(
              require("drizzle-orm").eq(
                require("../drizzle/schema").shortLinks.id,
                link.id
              )
            );

          // Atualizar saldo do usuário
          const user = await getUserById(link.userId);
          if (user) {
            const newBalance =
              parseFloat(user.balance.toString()) + earningsGenerated;
            const newTotalEarnings =
              parseFloat(user.totalEarnings.toString()) + earningsGenerated;

            await db
              .update(require("../drizzle/schema").users)
              .set({
                balance: newBalance.toString(),
                totalEarnings: newTotalEarnings.toString(),
                totalClicks: user.totalClicks + 1,
              })
              .where(
                require("drizzle-orm").eq(
                  require("../drizzle/schema").users.id,
                  user.id
                )
              );

            // Processar comissão de indicação
            if (user.referrerId) {
              const commission = calculateReferralCommission(
                earningsGenerated,
                parseFloat(settings.referralCommissionPercentage.toString())
              );

              const referrer = await getUserById(user.referrerId);
              if (referrer) {
                const referrerNewBalance =
                  parseFloat(referrer.balance.toString()) + commission;
                const referrerNewCommission =
                  parseFloat(referrer.referralCommissionEarned.toString()) +
                  commission;

                await db
                  .update(require("../drizzle/schema").users)
                  .set({
                    balance: referrerNewBalance.toString(),
                    referralCommissionEarned: referrerNewCommission.toString(),
                  })
                  .where(
                    require("drizzle-orm").eq(
                      require("../drizzle/schema").users.id,
                      referrer.id
                    )
                  );
              }
            }
          }
        } else {
          // Apenas incrementar clique total mesmo se inválido
          await db
            .update(require("../drizzle/schema").shortLinks)
            .set({ clicks: link.clicks + 1 })
            .where(
              require("drizzle-orm").eq(
                require("../drizzle/schema").shortLinks.id,
                link.id
              )
            );
        }

        return {
          success: true,
          isValid,
          originalUrl: link.originalUrl,
        };
      }),
  }),

  withdrawals: router({
    request: protectedProcedure
      .input(z.object({ amount: z.number().positive() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const user = await getUserById(ctx.user!.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const settings = await getSettings();
        if (!settings) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const minimumWithdrawal = parseFloat(
          settings.minimumWithdrawal.toString()
        );
        if (input.amount < minimumWithdrawal) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Valor mínimo de saque é R$ ${minimumWithdrawal.toFixed(2)}`,
          });
        }

        const userBalance = parseFloat(user.balance.toString());
        if (input.amount > userBalance) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saldo insuficiente",
          });
        }

        await createWithdrawal({
          userId: ctx.user!.id,
          amount: input.amount.toString(),
          status: "pending",
        });

        return { success: true, message: "Solicitação de saque criada" };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserWithdrawals(ctx.user!.id);
    }),
  }),

  admin: router({
    settings: router({
      get: adminProcedure.query(async () => {
        await initializeSettings();
        return await getSettings();
      }),

      update: adminProcedure
        .input(
          z.object({
            cpm: z.number().optional(),
            referralCommissionPercentage: z.number().optional(),
            minimumWithdrawal: z.number().optional(),
            maxClicksPerIpPerHour: z.number().optional(),
          })
        )
        .mutation(async ({ input }) => {
          const updates: any = {};
          if (input.cpm !== undefined) updates.cpm = input.cpm.toString();
          if (input.referralCommissionPercentage !== undefined)
            updates.referralCommissionPercentage =
              input.referralCommissionPercentage.toString();
          if (input.minimumWithdrawal !== undefined)
            updates.minimumWithdrawal = input.minimumWithdrawal.toString();
          if (input.maxClicksPerIpPerHour !== undefined)
            updates.maxClicksPerIpPerHour = input.maxClicksPerIpPerHour;

          await updateSettings(updates);
          return { success: true };
        }),
    }),

    users: router({
      list: adminProcedure
        .input(
          z.object({
            limit: z.number().default(50),
            offset: z.number().default(0),
          })
        )
        .query(async ({ input }) => {
          return await getAllUsers(input.limit, input.offset);
        }),

      getStats: adminProcedure.query(async () => {
        return await getSystemStats();
      }),
    }),

    links: router({
      list: adminProcedure
        .input(
          z.object({
            limit: z.number().default(50),
            offset: z.number().default(0),
          })
        )
        .query(async ({ input }) => {
          return await getAllShortLinks(input.limit, input.offset);
        }),
    }),

    clicks: router({
      list: adminProcedure
        .input(
          z.object({
            limit: z.number().default(50),
            offset: z.number().default(0),
          })
        )
        .query(async ({ input }) => {
          return await getAllClicks(input.limit, input.offset);
        }),
    }),

    withdrawals: router({
      list: adminProcedure.query(async () => {
        return await getPendingWithdrawals();
      }),

      approve: adminProcedure
        .input(
          z.object({
            withdrawalId: z.number(),
            notes: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          await updateWithdrawal(input.withdrawalId, {
            status: "paid",
            processedAt: new Date(),
            processedBy: ctx.user!.id,
            notes: input.notes,
          });

          return { success: true };
        }),

      reject: adminProcedure
        .input(
          z.object({
            withdrawalId: z.number(),
            notes: z.string(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const db = await getDb();
          if (!db) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          }

          // Obter informações do saque
          const withdrawalsTable = require("../drizzle/schema").withdrawals;
          const result = await db
            .select()
            .from(withdrawalsTable)
            .where(
              require("drizzle-orm").eq(withdrawalsTable.id, input.withdrawalId)
            )
            .limit(1);

          if (result.length === 0) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          const withdrawal = result[0];

          // Devolver saldo ao usuário
          const user = await getUserById(withdrawal.userId);
          if (user) {
            const newBalance =
              parseFloat(user.balance.toString()) +
              parseFloat(withdrawal.amount.toString());

            await db
              .update(require("../drizzle/schema").users)
              .set({ balance: newBalance.toString() })
              .where(
                require("drizzle-orm").eq(
                  require("../drizzle/schema").users.id,
                  user.id
                )
              );
          }

          // Atualizar status do saque
          await updateWithdrawal(input.withdrawalId, {
            status: "rejected",
            processedAt: new Date(),
            processedBy: ctx.user!.id,
            notes: input.notes,
          });

          return { success: true };
        }),
    }),
  }),

  api: router({
    generateLink: publicProcedure
      .input(
        z.object({
          apiKey: z.string(),
          originalUrl: z.string().url(),
          title: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const user = await getUserByApiKey(input.apiKey);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "API key inválida",
          });
        }

        if (!isValidUrl(input.originalUrl)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "URL inválida",
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const shortCode = generateShortCode();

        await db
          .insert(require("../drizzle/schema").shortLinks)
          .values({
            userId: user.id,
            originalUrl: input.originalUrl,
            shortCode,
            title: input.title,
          });

        return {
          shortCode,
          shortUrl: `/r/${shortCode}`,
          originalUrl: input.originalUrl,
        };
      }),

    getStats: publicProcedure
      .input(
        z.object({
          apiKey: z.string(),
          shortCode: z.string(),
        })
      )
      .query(async ({ input }) => {
        const user = await getUserByApiKey(input.apiKey);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "API key inválida",
          });
        }

        const link = await getShortLinkByCode(input.shortCode);
        if (!link || link.userId !== user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        return {
          shortCode: link.shortCode,
          originalUrl: link.originalUrl,
          clicks: link.clicks,
          validClicks: link.validClicks,
          earnings: link.earnings,
          createdAt: link.createdAt,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
