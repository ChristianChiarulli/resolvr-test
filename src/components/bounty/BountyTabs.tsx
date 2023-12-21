import useAuth from "~/hooks/useAuth";
import { cn, fromNow } from "~/lib/utils";
import nq from "~/nostr-query";
import { BookOpen, LockIcon, MessagesSquare, Users } from "lucide-react";
import Link from "next/link";
import { type Event } from "nostr-tools";

import ApplicantFeed from "../applications/ApplicantFeed";
import ApplicationCount from "../applications/ApplicationCount";
import BountyDetails from "./BountyDetails";
import Discussion from "./Discussion";

type BountyTabsProps = {
  bounty: Event | undefined;
  selectedTab: string;
};

type TabProps = {
  selectedTab: string;
  bounty: Event | undefined;
};

function DetailTab({ selectedTab }: TabProps) {
  return (
    <Link
      replace={true}
      key={"details"}
      href={"?tab=details"}
      className={cn(
        selectedTab === "details"
          ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
          : "border-transparent text-muted-foreground hover:border-foreground hover:text-foreground",
        "group inline-flex items-center border-b px-1 py-4 text-sm font-medium",
      )}
    >
      <BookOpen
        className={cn(
          selectedTab === "details"
            ? "text-indigo-600 dark:text-indigo-500"
            : "text-muted-foreground group-hover:text-foreground",
          "-ml-0.5 mr-2 h-5 w-5",
        )}
      />
      <span>Details</span>
    </Link>
  );
}

function ApplicationTab({ selectedTab, bounty }: TabProps) {
  return (
    <Link
      replace={true}
      href={"?tab=applications"}
      className={cn(
        selectedTab === "applications"
          ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
          : "border-transparent text-muted-foreground hover:border-foreground hover:text-foreground",
        "group inline-flex items-center border-b px-1 py-4 text-sm font-medium",
      )}
    >
      <Users
        className={cn(
          selectedTab === "applications"
            ? "text-indigo-600 dark:text-indigo-500"
            : "text-muted-foreground group-hover:text-foreground",
          "-ml-0.5 mr-2 h-5 w-5",
        )}
      />
      <span className="flex gap-x-1">
        {bounty && <ApplicationCount bounty={bounty} />}
        Applications
      </span>
    </Link>
  );
}

// to show for logged in user bounty must have p tag, and you must be signed in
// to show for applicant bounty must have p tag, and it must match your logged in pubkey
function DiscussionTab({ selectedTab, bounty }: TabProps) {
  const { pubkey } = useAuth();

  if (
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    (pubkey === bounty?.pubkey && nq.tag("p", bounty)) ||
    pubkey === nq.tag("p", bounty)
  ) {
    return (
      <Link
        replace={true}
        href={"?tab=discussion"}
        className={cn(
          selectedTab === "discussion"
            ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-500"
            : "border-transparent text-muted-foreground hover:border-foreground hover:text-foreground",
          "group inline-flex items-center border-b px-1 py-4 text-sm font-medium",
        )}
      >
        <MessagesSquare
          className={cn(
            selectedTab === "discussion"
              ? "text-indigo-600 dark:text-indigo-500"
              : "text-muted-foreground group-hover:text-foreground",
            "-ml-0.5 mr-2 h-5 w-5",
          )}
        />
        <span>Discussion</span>
      </Link>
    );
  }
  return (
    <span className="group inline-flex cursor-not-allowed items-center border-b border-transparent px-1 py-4 text-sm font-medium text-muted-foreground">
      <LockIcon className="-ml-0.5 mr-2 h-5 w-5 text-muted-foreground" />
      <span>Discussion</span>
    </span>
  );
}

export default function BountyTabs({ bounty, selectedTab }: BountyTabsProps) {
  return (
    <div>
      <div className="w-full sm:block">
        <div className="border-b">
          <nav
            className="no-scrollbar -mb-px flex space-x-2 overflow-x-auto sm:space-x-8"
            aria-label="Tabs"
          >
            <DetailTab selectedTab={selectedTab} bounty={bounty} />
            <ApplicationTab selectedTab={selectedTab} bounty={bounty} />
            <DiscussionTab selectedTab={selectedTab} bounty={bounty} />
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
          {bounty?.content && <BountyDetails bounty={bounty} />}
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
      {selectedTab === "discussion" && (
        <>
          <div className="flex items-center justify-between">
            <h4 className="scroll-m-20 py-4 text-xl font-semibold tracking-tight">
              Discussion
            </h4>
            <span className="text-sm text-muted-foreground">
              {fromNow(bounty?.created_at) ?? "unknown"}
            </span>
          </div>
          {bounty && (
            <Discussion
              bounty={bounty}
              applicantPubkey={nq.tag("p", bounty)!}
            />
          )}
        </>
      )}
    </div>
  );
}
