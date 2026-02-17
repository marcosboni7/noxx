import { NextResponse } from "next/server";
// Voltando 4 níveis para chegar na pasta lib: 
// 1. active -> 2. streams -> 3. api -> 4. app -> lib
import prisma from "../../../../lib/prismadb"; 

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const activeStreams = await prisma.stream.findMany({
      where: {
        isLive: true,
      },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          }
        },
      },
    });

    console.log(`[API_ACTIVE_CHECK]: Encontradas ${activeStreams.length} lives.`);

    return NextResponse.json(activeStreams);
  } catch (error) {
    console.error("[API_ACTIVE_ERROR]:", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}