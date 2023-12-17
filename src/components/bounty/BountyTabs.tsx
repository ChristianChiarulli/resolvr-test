import { capitalizeFirstLetter, cn, fromNow } from "~/lib/utils";
import { BookOpen, LockIcon, Users } from "lucide-react";
import Link from "next/link";
import { type Event } from "nostr-tools";

import ApplicantFeed from "../applications/ApplicantFeed";
import ApplicationCount from "../applications/ApplicationCount";
import BountyDetails from "./BountyDetails";

type Props = {
  bounty: Event | undefined;
  selectedTab: string;
};

const tabs = [
  { name: "details", icon: BookOpen },
  { name: "applications", icon: Users },
  { name: "discussion", icon: LockIcon },
];

export default function BountyTabs({ bounty, selectedTab }: Props) {
  return (
    <div>
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

                <span className="flex gap-x-1">
                  {tab.name === "applications" && bounty && (
                    <ApplicationCount bounty={bounty} />
                  )}
                  <span>{capitalizeFirstLetter(tab.name)}</span>
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {selectedTab === "details" && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="scroll-m-20 py-4 text-xl font-semibold tracking-tight">
              Bounty Description
            </h4>
            <span className="text-sm text-muted-foreground">
              {fromNow(bounty?.created_at) ?? "unknown"}
            </span>
          </div>
          {bounty?.content && <BountyDetails details={bounty?.content} />}
        </>
      )}
      {selectedTab === "applications" && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="scroll-m-20 py-4 text-xl font-semibold tracking-tight">
              Applications
            </h4>
            <span className="text-sm text-muted-foreground">
              {fromNow(bounty?.created_at) ?? "unknown"}
            </span>
          </div>
          {bounty && <ApplicantFeed bounty={bounty} />}
        </>
      )}
    </div>
  );
}
