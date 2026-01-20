import { describe, it, expect } from "vitest";
import { getAtProtoBlobCid, buildAtProtoBlobUrl } from "./blobUtils";

describe("blobUtils", () => {
  describe("getAtProtoBlobCid", () => {
    it("extracts CID from modern blob format (ref.$link)", () => {
      const blob = {
        ref: { $link: "bafyreicid12345" },
        mimeType: "image/png",
        size: 1234,
      };
      expect(getAtProtoBlobCid(blob)).toBe("bafyreicid12345");
    });

    it("extracts CID from legacy blob format (cid string)", () => {
      const legacyBlob = {
        cid: "bafyreilegacycid",
        mimeType: "image/jpeg",
      };
      expect(getAtProtoBlobCid(legacyBlob)).toBe("bafyreilegacycid");
    });

    it("handles various CID formats", () => {
      // CIDv1 base32
      const blobV1 = {
        ref: {
          $link: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        },
        mimeType: "image/png",
        size: 5000,
      };
      expect(getAtProtoBlobCid(blobV1)).toBe(
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      );

      // CIDv0 (starts with Qm)
      const legacyBlobV0 = {
        cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        mimeType: "image/jpeg",
      };
      expect(getAtProtoBlobCid(legacyBlobV0)).toBe(
        "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      );
    });
  });

  describe("buildAtProtoBlobUrl", () => {
    it("constructs correct URL with all parameters", () => {
      const result = buildAtProtoBlobUrl(
        "https://bsky.social",
        "did:plc:abc123",
        "bafyreicid12345",
      );
      expect(result).toBe(
        "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:plc:abc123&cid=bafyreicid12345",
      );
    });

    it("removes trailing slash from PDS URL", () => {
      const result = buildAtProtoBlobUrl(
        "https://bsky.social/",
        "did:plc:abc123",
        "bafyreicid12345",
      );
      expect(result).toBe(
        "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:plc:abc123&cid=bafyreicid12345",
      );
    });

    it("handles PDS URL without trailing slash", () => {
      const result = buildAtProtoBlobUrl(
        "https://custom.pds.example.com",
        "did:plc:xyz789",
        "bafyreitest",
      );
      expect(result).toBe(
        "https://custom.pds.example.com/xrpc/com.atproto.sync.getBlob?did=did:plc:xyz789&cid=bafyreitest",
      );
    });

    it("works with did:web DIDs", () => {
      const result = buildAtProtoBlobUrl(
        "https://bsky.social",
        "did:web:example.com",
        "bafyreicid",
      );
      expect(result).toBe(
        "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:web:example.com&cid=bafyreicid",
      );
    });

    it("works with self-hosted PDS URLs", () => {
      const result = buildAtProtoBlobUrl(
        "https://pds.my-server.org:3000",
        "did:plc:myuser",
        "bafyreicid",
      );
      expect(result).toBe(
        "https://pds.my-server.org:3000/xrpc/com.atproto.sync.getBlob?did=did:plc:myuser&cid=bafyreicid",
      );
    });

    it("preserves URL path if present before xrpc", () => {
      // Some PDS setups might have a base path
      const result = buildAtProtoBlobUrl(
        "https://example.com/pds/",
        "did:plc:test",
        "bafyreicid",
      );
      expect(result).toBe(
        "https://example.com/pds/xrpc/com.atproto.sync.getBlob?did=did:plc:test&cid=bafyreicid",
      );
    });
  });
});
