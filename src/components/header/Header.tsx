/* eslint-disable @next/next/no-img-element */

import { authOptions } from "~/app/api/auth/[...nextauth]/auth";
import nq from "~/nostr-query";
import { type UserWithKeys } from "~/types";
import { Plus } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { type Event } from "nostr-tools";

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
        <Link className="text-2xl hidden dark:block" href="/">
          <Image src="/resolvr-logo-dark.png" alt="Nostr" width={120} height={120} />
        </Link>
        <Link className="text-2xl dark:hidden" href="/">
          <Image src="/resolvr-logo-light.png" alt="Nostr" width={120} height={120} />
        </Link>
      </nav>
      <div className="flex items-center justify-center gap-x-4">
        {loggedIn && (
          <Button
            asChild
            variant="outline"
            className="border-primary hover:bg-primary/90"
            size="sm"
          >
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
