import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { type Event } from "nostr-tools";

import { Button } from "../ui/button";

type Props = {
  bounty: Event;
};

export default function BountyMenu({ bounty }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          size="smIcon"
          variant="outline"
          className="flex dark:bg-secondary/70 dark:hover:bg-secondary/60"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2">
        {/* <DropdownMenuItem>Broadcast</DropdownMenuItem> */}
        {/* <DropdownMenuItem>View Raw</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          className="dark:text-red-400 dark:focus:bg-red-400/10 dark:focus:text-red-400 "
        >
          Delete Bounty
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
