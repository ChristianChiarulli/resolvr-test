import { SatoshiV2Icon } from "@bitcoin-design/bitcoin-icons-react/filled";
import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import { type Event } from "nostr-tools";

import { Badge } from "../ui/badge";
import ApplyButton from "./ApplyButton";
import BountyMenu from "./BountyMenu";
import CompleteButton from "./CompleteButton";
import Profile from "./Profile";

type Props = {
  bounty: Event | undefined;
};

// TODO: skeleton loader for when bounty is undefined
export default function BountyMetadata({ bounty }: Props) {
  const { pubkey } = useAuth();

  const isLoggedInUserBounty = pubkey && bounty?.pubkey === pubkey;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="-ml-2 flex items-center text-3xl font-semibold text-orange-500 dark:text-orange-400">
          <SatoshiV2Icon className="h-8 w-8" />
          {Number(nq.tag("reward", bounty) ?? 0).toLocaleString()}
        </h1>
        {nq.tag("s", bounty) && (
          <Badge className="text-sm" variant="outline">
            {nq.tag("s", bounty)}
          </Badge>
        )}
      </div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {nq.tag("title", bounty)}
      </h3>
      <div className="flex items-center justify-between gap-x-2">
        {bounty?.pubkey && <Profile pubkey={bounty?.pubkey} />}
        {bounty && !isLoggedInUserBounty && <ApplyButton bounty={bounty} />}
        {bounty && isLoggedInUserBounty && (
          <div className="flex gap-x-1">
            <BountyMenu bounty={bounty} />
            {/* <CompleteButton bounty={bounty} /> */}
          </div>
        )}
      </div>
    </>
  );
}
