import { type User } from "next-auth";

export type UserWithKeys = User & {
  secretKey: Uint8Array;
  publicKey: string;
};


export type TokenWithKeys = {
  secretKey: Uint8Array;
  publicKey: string;
};
