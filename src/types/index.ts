import { type User } from "next-auth";

export type UserWithKeys = User & {
  secretKey: string;
  publicKey: string;
};


export type TokenWithPublicKey = {
  publicKey: string;
};

