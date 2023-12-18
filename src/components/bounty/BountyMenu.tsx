import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
        <div
          className="flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-secondary/70 dark:hover:bg-secondary/60"
        >
          <MoreVertical className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2">
        {/* <DropdownMenuItem>Broadcast</DropdownMenuItem> */}
        {/* <DropdownMenuItem>View Raw</DropdownMenuItem> */}
        {/* <DropdownMenuSeparator /> */}
        <DropdownMenuItem className="dark:text-red-400 dark:focus:bg-red-400/10 dark:focus:text-red-400 ">
          Delete Bounty
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
