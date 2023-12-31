import React from "react";

import nq from "~/nostr-query";
import useEventStore from "~/store/event-store";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "../ui/badge";

type Props = {
  pubkey: string;
};

export default function WebsiteBadge({ pubkey }: Props) {
  const { profileMap } = useEventStore();

  return (
    <Link
      href={`https://${nq.profileContent(profileMap[pubkey]).website}` ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge className="text-xs sm:aspect-auto aspect-square" variant="secondary">
        <GlobeIcon className="sm:mr-1 h-4 w-4" />
        <span className="truncate hidden sm:block">
          {nq.profileContent(profileMap[pubkey]).website}
        </span>
      </Badge>
    </Link>
  );
}
