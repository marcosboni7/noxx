import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prismadb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Buscar o utilizador atual
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    const xpGain = 10;
    let newXp = (user.xp || 0) + xpGain;
    let newLevel = user.level || 1;

    // 2. Lógica simples de Level Up (ex: cada 100 XP = 1 Level)
    const xpToNextLevel = newLevel * 100;

    if (newXp >= xpToNextLevel) {
      newXp = newXp - xpToNextLevel; // Reset do XP para o próximo nível
      newLevel += 1;
    }

    // 3. Atualizar no banco
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel
      }
    });

    return NextResponse.json({
      xp: updatedUser.xp,
      level: updatedUser.level,
      leveledUp: newLevel > (user.level || 1)
    });

  } catch (error) {
    console.error("[XP_GAIN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}