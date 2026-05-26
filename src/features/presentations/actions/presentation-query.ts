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