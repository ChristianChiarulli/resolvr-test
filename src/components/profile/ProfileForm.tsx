"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/use-toast";
import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import { type UseProfileEventParams } from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type EventTemplate, type Event } from "nostr-tools";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username must be at least 1 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  website: z.string(),
  bio: z.string().max(160).min(4),
  lud16: z.string(),
  github: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type Props = {
  profileEvent: Event;
};

export default function ProfileForm({ profileEvent }: Props) {
  const { pubRelays } = useRelayStore();

  // This can come from your database or API.
  const defaultValues: Partial<ProfileFormValues> = {
    bio: "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    const { username, website, bio, lud16, github } = data;

    if (!pubkey) return;

    const profile = nq.profileContent(profileMap[pubkey]);
    let tags = profileMap[pubkey]?.tags;

    if (!tags) {
      tags = [];
    }

    profile.name = username;
    profile.website = website;
    profile.about = bio;
    profile.lud16 = lud16;

    const content = JSON.stringify(profile);

    const event: EventTemplate = {
      kind: 0,
      tags,
      content,
      created_at: Math.floor(Date.now() / 1000),
    };

    console.log(event);

    // toast({
    //   title: "You submitted the following values:",
    //   description: (
    //     <pre className="mt-2 w-[340px] rounded-md bg-gray-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  defaultValue={nq.profileContent(profileMap[pubkey!]).name}
                  placeholder="satoshi"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  defaultValue={nq.profileContent(profileMap[pubkey!]).website}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  defaultValue={nq.profileContent(profileMap[pubkey!]).about}
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Separator />
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold tracking-tight">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Manage integrations with external services.
          </p>
        </div>
        <FormField
          control={form.control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Github</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Link your Github account to your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lud16"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lightning Address</FormLabel>
              <FormControl>
                <Input
                  defaultValue={nq.profileContent(profileMap[pubkey!]).lud16}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Link your Lightning Address to your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
