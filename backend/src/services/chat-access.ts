export const isObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

export const isChatParticipant = (
  chat: { user1Id?: string | null; user2Id?: string | null } | null | undefined,
  userId: string,
) => Boolean(userId) && Boolean(chat) && (chat!.user1Id === userId || chat!.user2Id === userId);
