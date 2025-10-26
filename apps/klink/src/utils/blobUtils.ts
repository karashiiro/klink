import type { Blob, LegacyBlob } from "@atcute/lexicons";

/**
 * Extracts the CID from a Blob reference
 */
export function getAtProtoBlobCid(blob: Blob | LegacyBlob): string {
  return "ref" in blob ? blob.ref.$link : blob.cid;
}

/**
 * Constructs a URL to fetch a blob from a PDS
 */
export function buildAtProtoBlobUrl(
  pdsUrl: string,
  did: string,
  cid: string,
): string {
  const cleanPdsUrl = pdsUrl.endsWith("/") ? pdsUrl.slice(0, -1) : pdsUrl;
  return `${cleanPdsUrl}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`;
}
