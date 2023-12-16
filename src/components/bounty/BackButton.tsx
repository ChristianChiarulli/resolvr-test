import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "../ui/button";

export default function BackButton() {
  return (
    <Link href="/">
      {/* TODO: route back if routing back to / if not just route to / */}
      <Button className="flex bg-secondary/70 hover:bg-secondary/60">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to all Bounties
      </Button>
    </Link>
  );
}
