"use client";

import { useEffect } from "react";

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
import { useToast } from "~/components/ui/use-toast";
import useAuth from "~/hooks/useAuth";
import nq from "~/nostr-query";
import {
  type UseProfileEventParams,
  type UsePublishEventParams,
} from "~/nostr-query/types";
import useProfileEvent from "~/nostr-query/useProfileEvent";
import usePublishEvent from "~/nostr-query/usePublishEvent";
import useEventStore from "~/store/event-store";
import { useRelayStore } from "~/store/relay-store";
import { type Event, type EventTemplate } from "nostr-tools";
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

export default function SettingsPage() {
  const { pubRelays, subRelays } = useRelayStore();
  const { profileMap, addProfile } = useEventStore();
  const { pubkey } = useAuth();
  const { toast } = useToast();

  const params: UseProfileEventParams = {
    pubkey: pubkey!,
    relays: subRelays,
    shouldFetch: !profileMap[pubkey!],
    onProfileEvent: (event) => {
      addProfile(pubkey!, event);
    },
  };

  useProfileEvent(params);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      website: "",
      bio: "",
      github: "",
      lud16: "",
    },
    mode: "onChange",
  });

  const { reset } = form;

  useEffect(() => {
    const profileContent = nq.profileContent(profileMap[pubkey!]);
    if (profileContent) {
      reset({
        username: profileContent.name,
        website: profileContent.website,
        bio: profileContent.about,
        // github: profileContent.github, // Assuming this is part of the profile
        lud16: profileContent.lud16,
      });
    }
  }, [reset, profileMap, pubkey]);

  const publishParams: UsePublishEventParams = {
    relays: pubRelays,
  };
  const { publishEvent, status } = usePublishEvent(publishParams);

  async function onSubmit(data: ProfileFormValues) {
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

    const eventTemplate: EventTemplate = {
      kind: 0,
      tags,
      content,
      created_at: Math.floor(Date.now() / 1000),
    };

    const event = await nq.finishEvent(eventTemplate);

    const onSeen = (_: Event) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated.",
      });
    };

    await publishEvent(event, onSeen);
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
                <Input placeholder="satoshi" {...field} />
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
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Link your Lightning Address to your profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={status !== "idle"} type="submit">
          Update profile
        </Button>
      </form>
    </Form>
  );
}
