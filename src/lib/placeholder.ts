import { mediaUrl } from "@/lib/api";

/** Temporary stand-in photos in public/dummy. Delete them and this module once real uploads exist. */
export const DUMMY_IMAGES = ["campus", "reunion", "library", "coffee", "science", "sports", "meetup", "workspace"] as const;
export type DummyImage = (typeof DUMMY_IMAGES)[number];

/** A named stand-in, or a stable pick from the pool for any other seed. */
export function dummyImage(seed: DummyImage | string): string {
  if ((DUMMY_IMAGES as readonly string[]).includes(seed)) return `/dummy/${seed}.jpg`;
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `/dummy/${DUMMY_IMAGES[hash % DUMMY_IMAGES.length]}.jpg`;
}

/** The uploaded image if there is one, otherwise a stand-in. */
export function imageOr(path: string | null | undefined, seed: string): string {
  return mediaUrl(path) ?? dummyImage(seed);
}
