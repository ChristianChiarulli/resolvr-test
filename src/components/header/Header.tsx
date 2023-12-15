/* eslint-disable @next/next/no-img-element */

import { authOptions } from "~/app/api/auth/[...nextauth]/auth";
import nq from "~/nostr-query";
import { type UserWithKeys } from "~/types";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

import { Button } from "../ui/button";
import { ThemeToggle } from "../ui/theme-toggle";
import LoginButton from "./LoginButton";
import UserProfile from "./UserProfile";

export default async function Header() {
  const session = await getServerSession(authOptions);
  let loggedIn = false;
  let publicKey = "";
  let profileEvent;

  if (session?.user) {
    console.log("session: ", session);
    const user = session?.user as UserWithKeys;
    publicKey = user.publicKey;
    if (publicKey) {
      loggedIn = true;
      const relays = ["wss://nos.lol", "wss://relay.damus.io"];
      profileEvent = await nq.fetchProfile({ pubkey: publicKey, relays });
    }
  }

  return (
    <header className="mb-2 flex items-center justify-between py-4 px-1">
      <nav className="flex items-center px-2.5">
        <Link className="text-2xl" href="/">
          resolvr
        </Link>
      </nav>
      <div className="flex items-center justify-center gap-x-4">
        {loggedIn && (
          <Button asChild variant="default" size="sm">
            <Link href="/post">
              <Plus className="h-4 w-4 mr-1" />
              bounty
            </Link>
          </Button>
        )}
        <ThemeToggle />
        {loggedIn ? (
          <UserProfile pubkey={publicKey} initialProfile={profileEvent} />
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}
