import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import { type UsePublishEventParams } from "~/nostr-query/types";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import { useRelayStore } from "~/store/relay-store";
import { MoreVertical } from "lucide-react";
import { type Event, type EventTemplate } from "nostr-tools";

import { useToast } from "../ui/use-toast";
import useEventStore from "~/store/event-store";
import { revalidateCachedTag } from "~/nostr-query/server";
import { useRouter } from "next/navigation";

type Props = {
  bounty: Event;
};

export default function BountyMenu({ bounty }: Props) {
  const { toast } = useToast();
  const { pubkey } = useAuth();
  const { pubRelays } = useRelayStore();
  const { openBountyEvents, postedBountyEvents, removeOpenBountyEvent, removePostedBountyEvent } = useEventStore();
  const router = useRouter();

  const params: UsePublishEventParams = {
    relays: pubRelays,
  };

  const { publishEvent, status } = usePublishEvent(params);

  async function handleDelete() {
    if (!pubkey) return;

    const tags = [["e", bounty.id]];

    const eventTemplate: EventTemplate = {
      kind: 5,
      tags,
      content: "",
      created_at: Math.floor(Date.now() / 1000),
    };

    const event = await nq.finishEvent(eventTemplate);

    const onSeen = (_: Event) => {

      if (openBountyEvents.length > 0) {
        // setOpenBountyEvents([event, ...openBountyEvents]);
        removeOpenBountyEvent(bounty.id);
      }
      if (postedBountyEvents.length > 0) {
        removePostedBountyEvent(bounty.id);
      }
      revalidateCachedTag("open-bounties");
      revalidateCachedTag(`posted-bounties-${pubkey}`);
      // TODO: should probably revalidate assigned as well

      router.push("/");

      toast({
        title: "Bounty deleted",
        description: "Your bounty has been deleted.",
      });
    };

    await publishEvent(event, onSeen);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-secondary/70 dark:hover:bg-secondary/60">
          <MoreVertical className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2">
        {/* <DropdownMenuItem>Broadcast</DropdownMenuItem> */}
        {/* <DropdownMenuItem>View Raw</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={status !== "idle"}
          className="dark:text-red-400 dark:focus:bg-red-400/10 dark:focus:text-red-400 "
        >
          Delete Bounty
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
