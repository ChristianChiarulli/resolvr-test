import { Check } from "lucide-react";
import { type Event } from "nostr-tools";

import { Button } from "../ui/button";

type Props = {
  applicationEvent: Event;
};

export default function AcceptApplicationButton({ applicationEvent }: Props) {
  return (
    <Button variant="default" size="sm" className="flex gap-x-1">
      <Check className="mr-1 h-4 w-4" />
      Accept Application
    </Button>
  );
}
