"use client";

import React, { useEffect, useState } from "react";

import { TAGS } from "~/lib/constants";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function BountyTags() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const [selectedTag, setSelectedTag] = useState<string>("");

  useEffect(() => {
    // const tagFromURL = params.get('tag');
    const tagFromURL = params.tag;
    if (tagFromURL && typeof tagFromURL === "string") {
      setSelectedTag(tagFromURL);
    } else {
      setSelectedTag(""); // Reset to default value if 'tag' is not in URL
    }
  }, [searchParams]);

  const handleValueChange = (newTag: string) => {
    // const updatedParams = new URLSearchParams(searchParams.toString());
    // updatedParams.set('tag', newTag);
    // router.push(`${pathname}?${updatedParams.toString()}`);
    if (newTag === "all") {
      router.push("/");
    } else router.push(`/tag/${newTag}`);
    setSelectedTag(newTag);
  };

  return (
    <Select onValueChange={handleValueChange} value={selectedTag}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select tag" />
      </SelectTrigger>
      <SelectContent>
        {["all", ...TAGS].map((tag: string) => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
