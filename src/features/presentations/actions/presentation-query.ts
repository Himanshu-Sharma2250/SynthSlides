import { createServerFn } from "@tanstack/react-start";
import { presentationIdInputSchema } from "../types/schema";
import { authMiddleware } from "#/middleware/auth.middleware";
import { prisma } from "#/db";

export const getPresentationWithSlides = createServerFn({method: "GET"})
    .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
    .middleware([authMiddleware])
    .handler(async ({data, context}) => {
        const userId = context?.session?.user?.id

        const row = await prisma.presentation.findFirst({
            where: {
                id: data.id,
                userId
            },
            include: {
                slides: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        return row
    })

export const listPresentations = createServerFn({method: 'GET'})
    .middleware([authMiddleware])
    .handler(async ({ context }) => {
        const userId = context?.session.user.id

        return await prisma.presentation.findMany({
            where: {userId},
            orderBy: {updatedAt: 'desc'}
        })
    })