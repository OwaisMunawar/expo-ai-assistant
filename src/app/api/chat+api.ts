import { handleChat } from '@/server/chat-handler';

export function POST(req: Request) {
  return handleChat(req);
}
