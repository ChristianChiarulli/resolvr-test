import useAuth from "~/hooks/useAuth";
import { revalidateCachedTag } from "~/nostr-query/server";
import { type UsePublishEventParams } from "~/nostr-query/types";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { Check } from "lucide-react";
import { type EventTemplate, type Event } from "nostr-tools";
import { tag, allTags, finishEvent } from "react-nostr";

import { Button } from "../ui/button";

type Props = {
  applicationEvent: Event;
  bountyEvent: Event;
};

export default function AcceptApplicationButton({
  applicationEvent,
  bountyEvent,
}: Props) {
  const { pubkey, seckey } = useAuth();
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

    const identifier = tag("d", bountyEvent);
    const title = tag("title", bountyEvent);
    const reward = tag("reward", bountyEvent);
    const currency = tag("c", bountyEvent);
    const tTags = allTags("t", bountyEvent);

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

    const eventTemplate: EventTemplate = {
      kind: 30050,
      tags: tags,
      content: bountyEvent.content,
      created_at: Math.floor(Date.now() / 1000),
      // pubkey: pubkey,
      // id: "",
      // sig: "",
    };

    // event.id = getEventHash(event);
    // event = (await nostr.signEvent(event)) as Event;

    const event = await finishEvent(eventTemplate, seckey);

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
      const dTagValue = tag("d", bountyEvent);
      const bountyPubkey = bountyEvent.pubkey;
      revalidateCachedTag(`${dTagValue}-${bountyPubkey}`);
    };

    if (!event) {
      // TODO: show error toast
      return;
    }

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
