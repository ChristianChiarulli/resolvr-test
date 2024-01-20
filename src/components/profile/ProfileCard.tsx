/* eslint-disable @next/next/no-img-element */
"use client";

import { BOT_AVATAR_ENDPOINT } from "~/lib/constants";
import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { Github, Globe, Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { profileContent } from "react-nostr";

type Props = {
  pubkey: string;
};

export default function ProfileCard({ pubkey }: Props) {
  const { profileMap, addProfile } = useEventStore();
  const { subRelays } = useRelayStore();

  const params: UseProfileEventParams = {
    pubkey: pubkey,
    relays: subRelays,
    shouldFetch: !profileMap[pubkey],
    onProfileEvent: (event) => {
      addProfile(pubkey, event);
    },
  };

  useProfileEvent(params);

  return (
    <div
      // className="sticky top-2 min-w-[20rem]"
      className="hidden min-w-[20rem] md:block"
    >
      <Card>
        <CardHeader>
          <CardTitle>{profileContent(profileMap[pubkey]).name}</CardTitle>
          <CardDescription>
            {profileContent(profileMap[pubkey]).nip05 ||
              shortNpub(pubkey)}
          </CardDescription>
          <img
            src={
              profileContent(profileMap[pubkey]).picture ||
              BOT_AVATAR_ENDPOINT + pubkey
            }
            alt=""
            className="aspect-square w-24 rounded-md border border-border dark:border-border"
          />
        </CardHeader>
        <CardContent>{profileContent(profileMap[pubkey]).about}</CardContent>
        <CardFooter>
          <div className="flex flex-col gap-y-2">
            {profileContent(profileMap[pubkey]).website && (
            <span className="flex items-center text-sm font-light text-muted-foreground">
              <Globe className="mr-1 h-4 w-4" />
              {profileContent(profileMap[pubkey]).website}
            </span>
            )}

            {profileContent(profileMap[pubkey]).lud16 && (
              <span className="flex items-center text-sm font-light text-muted-foreground">
                <Zap className="mr-1 h-4 w-4" />
                {profileContent(profileMap[pubkey]).lud16}
              </span>
            )}

            {profileContent(profileMap[pubkey]).github && (
              <span className="flex items-center text-sm font-light text-muted-foreground">
                <Github className="mr-1 h-4 w-4" />
                {profileContent(profileMap[pubkey]).github}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
