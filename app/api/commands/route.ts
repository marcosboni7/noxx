import { NextResponse } from "next/server";
import { pusherServer } from "../../../lib/pusher";
import prisma from "../../../lib/prismadb";

const processedVotes = new Set();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command, args, streamId, executor, ownerName } = body;

    if (!streamId || !command) {
      return new NextResponse("Incomplete Data", { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { username: executor }
    });

    const isAdmin = executor === ownerName || dbUser?.role === "SUPREMO";
    const isSupremo = dbUser?.role === "SUPREMO";

    // 1. COMANDO CLEAR (AGORA DELETA DO BANCO)
    if (command === "clear") {
      if (!isAdmin) return new NextResponse("Unauthorized", { status: 403 });
      
      // Limpa no banco de dados
      await prisma.message.deleteMany({
        where: { streamId: streamId }
      });

      // Limpa na tela de todo mundo
      await pusherServer.trigger(streamId, "node:chat_clear", {});
      return NextResponse.json({ success: true });
    }

    // 2. COMANDO BAN
    if (command === "ban") {
      if (!isAdmin) return new NextResponse("Unauthorized", { status: 403 });
      const userToBan = args[0];
      if (!userToBan) return new NextResponse("Username missing", { status: 400 });

      await pusherServer.trigger(streamId, "node:user_banned", {
        username: userToBan
      });
      return NextResponse.json({ success: true });
    }

    // 3. COMANDO ALERT
    if (command === "alert") {
      if (!isSupremo) return new NextResponse("Unauthorized", { status: 403 });
      const alertMessage = args.join(" ");
      await pusherServer.trigger(streamId, "node:staff_alert", {
        message: alertMessage || "ADMINISTRAÇÃO ONLINE.",
        executor: executor
      });
      return NextResponse.json({ success: true });
    }

    // 4. COMANDOS DE APOSTA
    if (command === "bet" || command === "win" || command === "endbet") {
      if (!isAdmin) return new NextResponse("Unauthorized", { status: 403 });
      if (command === "bet") {
        const title = args.join(" ");
        await pusherServer.trigger(streamId, "node:bet_start", {
          title: title || "Nova Missão",
          id: Math.random().toString(36).substring(7)
        });
        processedVotes.clear();
      } else {
        await pusherServer.trigger(streamId, "node:bet_end", { winner: args[0] });
      }
      return NextResponse.json({ success: true });
    }

    // 5. GLITCH
    if (command === "glitch") {
      await pusherServer.trigger(streamId, "node:command", { command: "glitch", executor });
    }

    // 6. VOTE
    if (command === "vote") {
      const voteKey = `${executor}-${streamId}`;
      if (processedVotes.has(voteKey)) return new NextResponse("Already voted", { status: 403 });
      processedVotes.add(voteKey);
      await pusherServer.trigger(streamId, "node:bet_vote", {
        executor,
        optionIndex: parseInt(args[0]) - 1
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COMMAND_ERROR]:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}