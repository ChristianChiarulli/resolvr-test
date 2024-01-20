import { useEffect, useState } from "react";

import { type UserWithKeys } from "~/types";
import { useSession } from "next-auth/react";

const useAuth= () => {
  const [pubkey, setPubkey] = useState<string | undefined>(undefined);
  const [seckey, setSeckey] = useState<Uint8Array | undefined>(undefined);
  const { data: session } = useSession();

  // useEffect(() => {
  //   if (session) {
  //     const user = session?.user as UserWithKeys;
  //     setPubkey(user.publicKey);
  //     setSeckey(user.secretKey);
  //   }
  // }, [session]);

  return { pubkey, seckey };
};

export default useAuth;
