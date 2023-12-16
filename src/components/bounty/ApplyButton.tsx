import { UserPlus2 } from "lucide-react";

import { Button } from "../ui/button";

export default function ApplyButton() {
  return (
    <Button className="flex text-sm">
      <UserPlus2 className="mr-1 h-4 w-4" />
      Apply
    </Button>
  );
}
