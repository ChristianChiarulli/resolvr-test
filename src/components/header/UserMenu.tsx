import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

type Props = {
  children: React.ReactNode;
};

export default function UserMenu({ children }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2">
        {/* <DropdownMenuItem>profile</DropdownMenuItem> */}
        <DropdownMenuItem asChild>
          <Link href="/settings">settings</Link>
        </DropdownMenuItem>
        {/* <DropdownMenuItem>relays</DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="dark:text-red-400 dark:focus:bg-red-400/10 dark:focus:text-red-400 "
        >
          sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
