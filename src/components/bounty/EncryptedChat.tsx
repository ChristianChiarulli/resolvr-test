import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import useAuth from "~/hooks/useAuth";
import { cn } from "~/lib/utils";
import nq from "~/nostr-query";
import {
  type ATagParams,
  type EncryptMessageParams,
  type UsePublishEventParams,
} from "~/nostr-query/types";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import { useRelayStore } from "~/store/relay-store";
import { Send } from "lucide-react";
import { type Event, type EventTemplate } from "nostr-tools";

type Props = {
  bounty: Event;
};

export default function EncryptedChat({ bounty }: Props) {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content: "Hi, how can I help you today?",
    },
    {
      role: "user",
      content: "Hey, I'm having trouble with my account.",
    },
    {
      role: "agent",
      content: "What seems to be the problem?",
    },
    {
      role: "user",
      content: "I can't log in.",
    },
  ]);
  const [input, setInput] = useState("");
  const inputLength = input.trim().length;

  const { pubkey: senderPublicKey, seckey } = useAuth();

  const [recipientPublicKey, setRecipientPublicKey] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (!senderPublicKey) return;

    if (senderPublicKey === bounty.pubkey) {
      setRecipientPublicKey(nq.tag("p", bounty));
    }

    if (senderPublicKey === nq.tag("p", bounty)) {
      setRecipientPublicKey(bounty.pubkey);
    }
  }, [senderPublicKey]);

  const { pubRelays } = useRelayStore();
  const publishParams: UsePublishEventParams = {
    relays: pubRelays,
  };
  const { publishEvent } = usePublishEvent(publishParams);

  const sendMessage = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const params: EncryptMessageParams = {
      recipientPublicKey: bounty.pubkey,
      message: input,
      secretKey: seckey,
    };

    const encryptedMessage = await nq.encryptMessage(params);

    // TODO: error toast
    if (!recipientPublicKey) return;

    const dTagValue = nq.tag("d", bounty);

    if (!dTagValue) return;

    const aTagParams: ATagParams = {
      kind: "30050",
      pubkey: bounty.pubkey,
      dTagValue,
    };

    const aTag = nq.createATag(aTagParams);

    if (!pubRelays[0]) return;

    const tags = [
      ["p", recipientPublicKey],
      ["a", aTag, pubRelays[0]],
    ];

    const eventTemplate: EventTemplate = {
      created_at: Math.floor(Date.now() / 1000),
      kind: 4,
      tags,
      content: encryptedMessage,
    };

    const event = await nq.finishEvent(eventTemplate, seckey);

    console.log("message", event);

    const onSeen = (event: Event) => {
      console.log(event);
    };

    // await publishEvent(event, onSeen);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/avatars/01.png" alt="Image" />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">Sofia Davis</p>
              <p className="text-sm text-muted-foreground">m@example.com</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputLength === 0) return;
              setMessages([
                ...messages,
                {
                  role: "user",
                  content: input,
                },
              ]);
              setInput("");
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              onClick={sendMessage}
              type="submit"
              size="icon"
              disabled={inputLength === 0}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </>
  );
}
