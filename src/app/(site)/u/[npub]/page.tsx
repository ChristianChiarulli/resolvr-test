import { authOptions } from "~/app/api/auth/[...nextauth]/auth";
import ProfileCard from "~/components/profile/ProfileCard";
import ProfileFeed from "~/components/profile/ProfileFeed";
import { type UserWithKeys } from "~/types";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { nip19, type Filter } from "nostr-tools";

type Props = {
  params: Record<string, string>;
};

export default async function UserProfile({ params }: Props) {
  const session = await getServerSession(authOptions);
  let loggedIn = false;
  let publicKey = "";

  if (session?.user) {
    const user = session?.user as UserWithKeys;
    publicKey = user.publicKey;
    if (publicKey) {
      loggedIn = true;
    }
  }

  const npub = params.npub;
  if (!npub) {
    notFound();
  }
  const decodedNpub = nip19.decode(npub);

  if (!decodedNpub) {
    notFound();
  }

  if (decodedNpub.type !== "npub") {
    notFound();
  }

  const profilePublicKey = decodedNpub.data;

  const filter: Filter = {
    kinds: [30050],
    authors: [profilePublicKey],
  };

  return (
    <div className="flex md:gap-x-4">
      <ProfileCard pubkey={profilePublicKey} />
      <ProfileFeed pubkey={profilePublicKey} filter={filter} />
    </div>
  );
}
