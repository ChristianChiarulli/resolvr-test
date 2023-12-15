"use server";

import { revalidateTag } from "next/cache";

const revalidateCachedTag = (tag: string) => {
  revalidateTag(tag);
};

export { revalidateCachedTag };
