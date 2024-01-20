import React, { useEffect } from "react";

import { validateGithub } from "~/nostr-query/server";
import useEventStore from "~/store/event-store";
import { CheckCircle, Github } from "lucide-react";
import Link from "next/link";
import { nip19 } from "nostr-tools";

import { Badge } from "../ui/badge";
import { identityTag, profileContent } from "react-nostr";

type Props = {
  pubkey: string;
};

export default function GithubBadge({ pubkey }: Props) {
  const { profileMap } = useEventStore();
  const [githubVerified, setGithubVerified] = React.useState<boolean>(false);

  useEffect(() => {
    if (githubVerified) return;

    const gist = identityTag("github",profileMap[pubkey]?.tags ?? [])?.[2];
    const github = profileContent(profileMap[pubkey]).github;
    const npub = nip19.npubEncode(pubkey);

    if (!github) return;
    if (!gist) return;

    async function fetchValidateGithub(
      npub: string,
      github: string,
      gist: string,
    ) {
      const validGist = await validateGithub(npub, github, gist);
      setGithubVerified(validGist);
    }

    void fetchValidateGithub(npub, github, gist);
  }, [githubVerified, profileMap, pubkey]);

  if (!profileContent(profileMap[pubkey]).github) return null;

  if (!githubVerified) return null;

  if (githubVerified) {
    return (
      <Link
        href={`https://${profileContent(profileMap[pubkey]).github}` ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="relative"
      >
        <Badge
          className="aspect-square text-xs sm:aspect-auto"
          variant="secondary"
        >
          <Github className="h-4 w-4 sm:mr-1" />
          <span className="hidden truncate sm:block">
            {profileContent(profileMap[pubkey]).github}
          </span>
        </Badge>
        <CheckCircle className="absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-secondary/100 text-green-400 ring-2 ring-secondary/0" />
      </Link>
    );
  }
}
