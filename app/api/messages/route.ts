import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prismadb"; 
import { pusherServer } from "../../../lib/pusher"; 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { content, streamId } = body;

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return new NextResponse("Usuário não encontrado", { status: 404 });
    }

    const isStaff = dbUser.role === "STAFF" || dbUser.role === "ADMIN" || dbUser.role === "SUPREMO";

    // --- LÓGICA DE COMANDOS (STAFF) ---
    if (content.startsWith("/")) {
      if (!isStaff) return new NextResponse("Sem permissão", { status: 403 });

      const parts = content.split(" ");
      const command = parts[0].toLowerCase();
      const args = parts.slice(1).join(" ");

      if (command === "/alert") {
        await pusherServer.trigger(streamId, "node:staff_alert", { message: args || "AVISO" });
        return NextResponse.json({ ok: true });
      }
      if (command === "/clear") {
        await prisma.message.deleteMany({ where: { streamId } });
        await pusherServer.trigger(streamId, "node:chat_clear", {});
        return NextResponse.json({ ok: true });
      }
      if (command === "/bet") {
        await pusherServer.trigger(streamId, "node:bet_start", { question: args || "Aposta!" });
        return NextResponse.json({ ok: true });
      }
      if (command === "/win") {
        await pusherServer.trigger(streamId, "node:bet_result", { winner: "YES", question: args });
        return NextResponse.json({ ok: true });
      }
      if (command === "/loss") {
        await pusherServer.trigger(streamId, "node:bet_result", { winner: "NO", question: args });
        return NextResponse.json({ ok: true });
      }
      if (command === "/endbet") {
        await pusherServer.trigger(streamId, "node:bet_end", {});
        return NextResponse.json({ ok: true });
      }
      return new NextResponse("Comando inválido", { status: 400 });
    }

    // --- LÓGICA DE XP E NÍVEL ---
    const XP_PER_MESSAGE = 10;
    const COOLDOWN_SECONDS = 30;
    const now = new Date();
    // @ts-ignore (garanta que o campo exista no schema.prisma)
    const lastGain = dbUser.lastXpGain ? new Date(dbUser.lastXpGain) : new Date(0);
    const secondsSinceLastGain = (now.getTime() - lastGain.getTime()) / 1000;

    let finalUser = dbUser;

    if (secondsSinceLastGain >= COOLDOWN_SECONDS) {
      // @ts-ignore
      const newXp = (dbUser.xp || 0) + XP_PER_MESSAGE;
      const newLevel = Math.floor(Math.sqrt(newXp / 10)) || 1;

      finalUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          // @ts-ignore
          xp: newXp,
          level: newLevel,
          lastXpGain: now
        }
      });
    }

    // --- SALVAR MENSAGEM ---
    const message = await prisma.message.create({
      data: {
        content,
        streamId,
        username: dbUser.username || "Anon",
      }
    });

    // Enviar para o Pusher com Nível e Role
    await pusherServer.trigger(streamId, "chat:message", {
      id: message.id,
      content: message.content,
      username: message.username,
      role: finalUser.role,
      // @ts-ignore
      level: finalUser.level || 1
    });

    return NextResponse.json(message);

  } catch (error) {
    console.log("[MESSAGES_ERROR]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}