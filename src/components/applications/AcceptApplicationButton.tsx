import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import { revalidateCachedTag } from "~/nostr-query/server";
import { type UsePublishEventParams } from "~/nostr-query/types";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { Check } from "lucide-react";
import { getEventHash, type Event } from "nostr-tools";

import { Button } from "../ui/button";

type Props = {
  applicationEvent: Event;
  bountyEvent: Event;
};

export default function AcceptApplicationButton({
  applicationEvent,
  bountyEvent,
}: Props) {
  const { pubkey } = useAuth();
  const {
    openBountyEvents,
    postedBountyEvents,
    removeOpenBountyEvent,
    removePostedBountyEvent,
    setCurrentBounty,
    appEventMap,
    setAppEvents,
    clearAppEvents,
  } = useEventStore();
  const { pubRelays, subRelays } = useRelayStore();

  const params: UsePublishEventParams = {
    relays: pubRelays,
  };

  const { publishEvent } = usePublishEvent(params);

  async function handleAcceptApplication(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.preventDefault();
    if (!pubkey) {
      // TODO: show error toast
      return;
    }

    const identifier = nq.tag("d", bountyEvent);
    const title = nq.tag("title", bountyEvent);
    const reward = nq.tag("reward", bountyEvent);
    const currency = nq.tag("c", bountyEvent);
    const tTags = nq.tags("t", bountyEvent);

    if (!identifier || !title || !reward || !currency) {
      return;
    }

    const tags = [
      ["d", identifier],
      ["title", title],
      ["s", "assigned"],
      ["reward", reward],
      ["c", currency],
      ["p", applicationEvent.pubkey],
      // TODO: find out why this is adding backticks
      // ["r", JSON.stringify(applicationEvent)],
    ];

    if (subRelays[0]) {
      tags.push(["e", applicationEvent.id, subRelays[0]]);
    } else {
      tags.push(["e", applicationEvent.id]);
    }

    if (tTags.length > 0) {
      tTags.forEach((tag) => {
        tags.push(["t", tag]);
      });
    }

    let event: Event = {
      kind: 30050,
      tags: tags,
      content: bountyEvent.content,
      created_at: Math.floor(Date.now() / 1000),
      pubkey: pubkey,
      id: "",
      sig: "",
    };
    event.id = getEventHash(event);
    event = (await nostr.signEvent(event)) as Event;
    const onSeen = (event: Event) => {
      if (openBountyEvents.length > 0) {
        removeOpenBountyEvent(bountyEvent.id);
      }
      if (postedBountyEvents.length > 0) {
        removePostedBountyEvent(bountyEvent.id);
      }
      setCurrentBounty(event);
      const appEvents = appEventMap[bountyEvent.id] ?? [];
      setAppEvents(event.id, appEvents);
      // TODO: REMOVE THE OLD APPLICATION EVENTS for the old bounty id
      clearAppEvents(bountyEvent.id);
      revalidateCachedTag("open-bounties");
      revalidateCachedTag(`posted-bounties-${pubkey}`);
      revalidateCachedTag(`assigned-bounties-${applicationEvent.pubkey}`);
      const dTagValue = nq.tag("d", bountyEvent);
      const bountyPubkey = bountyEvent.pubkey;
      revalidateCachedTag(`${dTagValue}-${bountyPubkey}`);
    };

    await publishEvent(event, onSeen);
  }

  return (
    <Button
      onClick={handleAcceptApplication}
      variant="default"
      size="sm"
      className="flex gap-x-1"
    >
      <Check className="mr-1 h-4 w-4" />
      Accept Application
    </Button>
  );
}
