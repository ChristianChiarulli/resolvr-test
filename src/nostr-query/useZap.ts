import { useCallback, useState } from "react";

import nq from "~/nostr-query";
import {
  type GetEventParams,
  type UseZapParams,
  type ZapParams,
  type ZapStatus,
} from "~/nostr-query/types";
import { type Event, type Filter } from "nostr-tools";

const useZap = ({
  pool,
  relays,
  secretKey,
  initialDelay = 100,
  retryInterval = 500,
}: UseZapParams) => {
  const [status, setStatus] = useState<ZapStatus>("idle");
  const [zapReceipt, setZapReceipt] = useState<Event | undefined>(undefined);
  const [sendPaymentResponse, setSendPaymentResponse] = useState<
    SendPaymentResponse | undefined
  >(undefined);

  const zap = useCallback(
    async (
      recipientProfile: Event,
      eventId: string,
      amount: number,
      content: string,
      onPaymentSuccess: (sendPaymentResponse: SendPaymentResponse) => void = (
        _: SendPaymentResponse,
      ) => {},
      onPaymentFailure: () => void = () => {},
      onZapReceipt: (event: Event) => void = (_: Event) => {},
      onNoZapReceipt: () => void = () => {},
    ) => {
      setStatus("pending");

      if (!recipientProfile || recipientProfile.content === "") {
        console.error("recipient profile not found");
        onPaymentFailure();
        setStatus("error");
        setStatus("idle");
        return;
      }

      const lud16= nq.profileContent(recipientProfile).lud16;

      if (!lud16) {
        console.error("lud16 not found");
        onPaymentFailure();
        setStatus("error");
        setStatus("idle");
        return;
      }

      const zapParams: ZapParams = {
        relays,
        recipientProfile,
        eventId,
        amount,
        content,
        secretKey,
      };

      try {
        const sendPaymentResponse = await nq.zap(zapParams);
        setSendPaymentResponse(sendPaymentResponse);
        onPaymentSuccess(sendPaymentResponse);
      } catch (e) {
        onPaymentFailure();
        setStatus("error");
        setStatus("idle");
        return;
      }

      setTimeout(() => {
        let attempts = 0;
        const maxAttempts = 5;

        const zapReceiptFilter: Filter = {
          kinds: [9735],
          "#e": [eventId],
        };

        const getEventParams: GetEventParams = {
          pool,
          relays,
          filter: zapReceiptFilter,
        };

        const checkReceipt = async () => {
          const zapReceipt = await nq.get(getEventParams);
          if (zapReceipt) {
            clearInterval(interval);
            setZapReceipt(zapReceipt);
            setStatus("success");
            setStatus("idle");
            onZapReceipt(zapReceipt);
          } else {
            attempts++;
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              setStatus("idle");
              onNoZapReceipt(); // Adjust as needed for error handling
            }
          }
        };

        const interval = setInterval(() => {
          void checkReceipt();
        }, retryInterval);
      }, initialDelay);
    },
    [pool, relays],
  );

  return { zap, status, sendPaymentResponse, zapReceipt };
};

export default useZap;
