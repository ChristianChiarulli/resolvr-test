import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { capitalizeFirstLetter, cn, fromNow } from "~/lib/utils";
import nq from "~/nostr-query";
import { NewspaperIcon, Upload, User2 } from "lucide-react";
import Link from "next/link";
import { type Event } from "nostr-tools";

import { Badge } from "../ui/badge";
import ApplyButton from "./ApplyButton";
import BountyDetails from "./BountyDescription";
import Profile from "./Profile";

type Props = {
  initialBounty: Event;
  selectedTab: string;
};

const tabs = [
  { name: "details", icon: NewspaperIcon },
  { name: "applications", icon: Upload },
  { name: "discussion", icon: User2 },
];

export default function Bounty({ initialBounty, selectedTab }: Props) {
  return (
    <div className="mt-8 flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <h1 className="-ml-2 flex items-center text-3xl font-semibold text-orange-500 dark:text-orange-400">
          <SatoshiV2Icon className="h-8 w-8" />
          {Number(nq.tag("reward", initialBounty)).toLocaleString()}
        </h1>
        {nq.tag("s", initialBounty) && (
          <Badge className="text-sm" variant="outline">
            {nq.tag("s", initialBounty)}
          </Badge>
        )}
      </div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {nq.tag("title", initialBounty)}
      </h3>
      <div className="flex items-center justify-between gap-x-2">
        <Profile pubkey={initialBounty.pubkey} />
        <ApplyButton />
      </div>

      <div className="w-full sm:block">
        <div className="border-b">
          <nav
            className="no-scrollbar -mb-px flex space-x-8 overflow-x-auto"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <Link
                replace={true}
                key={tab.name}
                href={`?tab=${tab.name.toLowerCase()}`}
                className={cn(
                  selectedTab === tab.name.toLowerCase()
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
                    : "border-transparent text-muted-foreground hover:border-primary-foreground hover:text-primary-foreground",
                  "group inline-flex items-center border-b px-1 py-4 text-sm font-medium",
                )}
              >
                <tab.icon
                  className={cn(
                    selectedTab === tab.name.toLowerCase()
                      ? "text-indigo-600 dark:text-indigo-500"
                      : "text-muted-foreground group-hover:text-primary-foreground",
                    "-ml-0.5 mr-2 h-5 w-5",
                  )}
                />

                <span>{capitalizeFirstLetter(tab.name)}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {selectedTab === "details" && (
        <>
          <div className="flex justify-between items-center">
            <h4 className="scroll-m-20 py-2 text-xl font-semibold tracking-tight">
              Bounty Description
            </h4>
            <span className="text-sm text-muted-foreground">{fromNow(initialBounty.created_at) ?? "unknown"}</span>
          </div>
          <BountyDetails details={initialBounty.content} />
        </>
      )}
    </div>
  );
}
