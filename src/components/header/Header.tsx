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
import { type Event } from "nostr-tools";

export default async function Header() {
  const session = await getServerSession(authOptions);
  let loggedIn = false;
  let publicKey = "";
  let profileEvent;

  if (session?.user) {
    // console.log("session: ", session);
    const user = session?.user as UserWithKeys;
    publicKey = user.publicKey;
    if (publicKey) {
      loggedIn = true;
      const relays = ["wss://nos.lol", "wss://relay.damus.io"];
      profileEvent = await nq.fetchProfile({ pubkey: publicKey, relays });
      // HACK: this is a workaround for dealing with passing symbols
      profileEvent = JSON.parse(JSON.stringify(profileEvent)) as Event;
    }
  }

  return (
    <header className="mb-2 flex items-center justify-between py-4">
      <nav className="flex items-center">
        <Link className="text-2xl" href="/">
          resolvr
        </Link>
      </nav>
      <div className="flex items-center justify-center gap-x-4">
        {loggedIn && (
          <Button asChild variant="outline" className="border-primary hover:bg-primary/90" size="sm">
            <Link href="/create">
              <Plus className="mr-1 h-4 w-4" />
              Bounty
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
