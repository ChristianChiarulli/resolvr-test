import { type Event } from "nostr-tools";

import nq from ".";

async function decryptMessage(event: Event, decryptPublicKey: string) {
  return await nostr.nip04.decrypt(decryptPublicKey, event.content);
}

async function encryptMessage(recipientPublicKey: string, message: string) {
  return await nostr.nip04.encrypt(recipientPublicKey, message);
}
