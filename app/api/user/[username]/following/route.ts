import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import db from "../../../../../lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> } // Promise para Next 16
) {
  try {
    const session = await getServerSession(authOptions);
    const { username } = await params; // IMPORTANTE: Unwrapping do username

    if (!session?.user?.email) {
      return NextResponse.json({ isFollowing: false });
    }

    // 1. Busca o usuário que será verificado (o streamer)
    const targetUser = await db.user.findUnique({
      where: { username }
    });

    if (!targetUser) {
      return NextResponse.json({ isFollowing: false });
    }

    // 2. Busca o seu usuário logado
    const self = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!self) {
      return NextResponse.json({ isFollowing: false });
    }

    // 3. Verifica se existe o registro na tabela Follow
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: self.id,
          followingId: targetUser.id,
        },
      },
    });

    // Retorna true se encontrou o registro, false se não
    return NextResponse.json({ isFollowing: !!follow });

  } catch (error) {
    console.error("ERRO_GET_FOLLOWING_STATUS:", error);
    return NextResponse.json({ isFollowing: false });
  }
}