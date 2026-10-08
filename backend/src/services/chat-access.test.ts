import assert from 'node:assert/strict';
import { isChatParticipant, isObjectId } from './chat-access.js';

const chat = {
  id: '64b0c0c0c0c0c0c0c0c0c0aa',
  user1Id: '64b0c0c0c0c0c0c0c0c0c0a1',
  user2Id: '64b0c0c0c0c0c0c0c0c0c0a2',
};

assert.equal(isObjectId(chat.id), true);
assert.equal(isObjectId('not-an-id'), false);
assert.equal(isChatParticipant(chat, chat.user1Id), true);
assert.equal(isChatParticipant(chat, chat.user2Id), true);
assert.equal(isChatParticipant(chat, '64b0c0c0c0c0c0c0c0c0c0ff'), false);
assert.equal(isChatParticipant(chat, ''), false);
assert.equal(isChatParticipant(null, chat.user1Id), false);
assert.equal(isChatParticipant(undefined, chat.user1Id), false);

console.log('chat access tests passed');
