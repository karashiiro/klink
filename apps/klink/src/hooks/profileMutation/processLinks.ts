import type { Main } from "@klink-app/lexicon/types";
import { processImage } from "./processImage";
import type { ProfileForm, AtProtoClient } from "./types";

/**
 * Processes links for ATProto storage.
 * Handles icon uploads for each link.
 *
 * @param client - The ATProto client for blob uploads
 * @param links - The links to process
 * @returns Processed links ready for ATProto record
 */
export async function processLinks(
  client: AtProtoClient,
  links: ProfileForm["links"],
): Promise<Main["links"]> {
  return Promise.all(
    links.map(async (link) => ({
      icon: (await processImage(client, link.icon)) as Main["links"][0]["icon"],
      label: link.label,
      href: link.href as `${string}:${string}`,
    })),
  );
}
