import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismadb";

export async function GET() {
  try {
    const liveStreams = await prisma.stream.findMany({
      where: {
        isLive: true,
      },
      include: {
        user: {
          select: {
            username: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(liveStreams);
  } catch (error) {
    return new NextResponse("Erro ao buscar lives", { status: 500 });
  }
}