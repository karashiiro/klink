import { describe, it, expect } from "vitest";
import {
  transformProfileImage,
  transformBackgroundForCreate,
  transformBackgroundForUpdate,
  transformLinkIcon,
  transformLinkIconForUpdate,
  transformProfileForCreate,
  transformProfileForUpdate,
  type ProfileAtomData,
} from "./profileUtils";

/**
 * Helper to create minimal ProfileAtomData for testing
 */
function createMockProfileData(
  overrides: Partial<ProfileAtomData> = {},
): ProfileAtomData {
  return {
    name: "Test User",
    location: "Test Location",
    bio: "Test bio",
    profileImage: undefined,
    profileImageBlob: null,
    background: undefined,
    backgroundImageBlob: null,
    backgroundImageUrl: "",
    backgroundColor: "#1a1a1a",
    backgroundShaderCode: "",
    backgroundType: "color",
    backgroundObjectFit: "cover",
    theme: {
      primaryColor: "#364163",
      secondaryColor: "#a58431",
      fontFamily: "",
      stylesheet: "",
    },
    links: [],
    logoMode: "none",
    ...overrides,
  };
}

/**
 * Helper to create mock existing profile for update tests
 */
function createMockExistingProfile(overrides: Record<string, unknown> = {}) {
  return {
    uri: "at://did:plc:test/moe.karashiiro.klink.profile/self",
    cid: "bafyreicid123",
    value: {
      $type: "moe.karashiiro.klink.profile" as const,
      bio: "Existing bio",
      background: {
        $type: "moe.karashiiro.klink.profile#colorBackground" as const,
        type: "color" as const,
        value: "#000000",
      },
      theme: {
        primaryColor: "#364163",
        secondaryColor: "#a58431",
      },
      links: [],
      logoMode: "none" as const,
      ...overrides,
    },
  };
}

describe("profileUtils", () => {
  describe("transformProfileImage", () => {
    it("returns undefined when no image data", () => {
      const data = createMockProfileData();
      const result = transformProfileImage(data);
      expect(result).toBeUndefined();
    });

    it("returns blob transformation when profileImageBlob exists", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      const data = createMockProfileData({ profileImageBlob: blob });

      const result = transformProfileImage(data);

      expect(result).toEqual({ type: "blob", value: blob });
    });

    it("returns url transformation for URL profile images", () => {
      const data = createMockProfileData({
        profileImage: {
          $type: "moe.karashiiro.klink.profile#urlImage",
          type: "url",
          value: "https://example.com/avatar.jpg",
        },
      });

      const result = transformProfileImage(data);

      expect(result).toEqual({
        type: "url",
        value: "https://example.com/avatar.jpg",
      });
    });

    it("prioritizes new blob over existing URL image", () => {
      const blob = new Blob(["new image"], { type: "image/jpeg" });
      const data = createMockProfileData({
        profileImageBlob: blob,
        profileImage: {
          $type: "moe.karashiiro.klink.profile#urlImage",
          type: "url",
          value: "https://example.com/old.jpg",
        },
      });

      const result = transformProfileImage(data);

      expect(result).toEqual({ type: "blob", value: blob });
    });

    it("preserves existing blob from profile on update when no new image", () => {
      const existingBlob = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreicid123" },
          mimeType: "image/png",
          size: 100,
        },
      };
      const existingProfile = createMockExistingProfile({
        profileImage: existingBlob,
      });
      const data = createMockProfileData();

      const result = transformProfileImage(data, existingProfile);

      expect(result).toBe(existingBlob);
    });

    it("returns new blob even when existing profile has blob", () => {
      const newBlob = new Blob(["new"], { type: "image/png" });
      const existingProfile = createMockExistingProfile({
        profileImage: {
          $type: "moe.karashiiro.klink.profile#blobImage",
          type: "blob",
          value: { ref: { $link: "old-cid" }, mimeType: "image/png", size: 50 },
        },
      });
      const data = createMockProfileData({ profileImageBlob: newBlob });

      const result = transformProfileImage(data, existingProfile);

      expect(result).toEqual({ type: "blob", value: newBlob });
    });
  });

  describe("transformBackgroundForCreate", () => {
    it("transforms color background", () => {
      const data = createMockProfileData({
        backgroundType: "color",
        backgroundColor: "#ff0000",
      });

      const result = transformBackgroundForCreate(data);

      expect(result).toEqual({ type: "color", value: "#ff0000" });
    });

    it("transforms blob background with new blob", () => {
      const blob = new Blob(["test"], { type: "image/jpeg" });
      const data = createMockProfileData({
        backgroundType: "blob",
        backgroundImageBlob: blob,
        backgroundObjectFit: "contain",
      });

      const result = transformBackgroundForCreate(data);

      expect(result).toEqual({
        type: "blob",
        value: blob,
        objectFit: "contain",
      });
    });

    it("transforms URL background", () => {
      const data = createMockProfileData({
        backgroundType: "url",
        background: {
          $type: "moe.karashiiro.klink.profile#urlBackground",
          type: "url",
          value: "https://example.com/bg.jpg",
          objectFit: "cover",
        },
        backgroundObjectFit: "cover",
      });

      const result = transformBackgroundForCreate(data);

      expect(result).toEqual({
        type: "url",
        value: "https://example.com/bg.jpg",
        objectFit: "cover",
      });
    });

    it("defaults to color when blob type but no blob data", () => {
      const data = createMockProfileData({
        backgroundType: "blob",
        backgroundImageBlob: null,
        backgroundColor: "#123456",
      });

      const result = transformBackgroundForCreate(data);

      expect(result).toEqual({ type: "color", value: "#123456" });
    });

    it("defaults to color for unknown/unhandled types", () => {
      const data = createMockProfileData({
        backgroundType: "shader", // shader without code in create
        backgroundColor: "#abcdef",
      });

      const result = transformBackgroundForCreate(data);

      expect(result).toEqual({ type: "color", value: "#abcdef" });
    });
  });

  describe("transformBackgroundForUpdate", () => {
    it("transforms color background", () => {
      const existingProfile = createMockExistingProfile();
      const data = createMockProfileData({
        backgroundType: "color",
        backgroundColor: "#ff0000",
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toEqual({ type: "color", value: "#ff0000" });
    });

    it("transforms new shader code", () => {
      const existingProfile = createMockExistingProfile();
      const data = createMockProfileData({
        backgroundType: "shader",
        backgroundShaderCode: "void main() { gl_FragColor = vec4(1.0); }",
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toEqual({
        type: "shader",
        value: "void main() { gl_FragColor = vec4(1.0); }",
      });
    });

    it("preserves existing shader blob when no new code", () => {
      const existingShader = {
        $type: "moe.karashiiro.klink.profile#shaderBackground" as const,
        type: "shader" as const,
        value: {
          ref: { $link: "bafyreishader" },
          mimeType: "text/plain",
          size: 200,
        },
      };
      const existingProfile = createMockExistingProfile({
        background: existingShader,
      });
      const data = createMockProfileData({
        backgroundType: "shader",
        backgroundShaderCode: "",
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toBe(existingShader);
    });

    it("transforms new blob background", () => {
      const blob = new Blob(["new bg"], { type: "image/png" });
      const existingProfile = createMockExistingProfile();
      const data = createMockProfileData({
        backgroundType: "blob",
        backgroundImageBlob: blob,
        backgroundObjectFit: "contain",
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toEqual({
        type: "blob",
        value: blob,
        objectFit: "contain",
      });
    });

    it("preserves existing blob background when no new blob", () => {
      const existingBlob = {
        $type: "moe.karashiiro.klink.profile#blobBackground" as const,
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreibg" },
          mimeType: "image/jpeg",
          size: 5000,
        },
        objectFit: "cover" as const,
      };
      const existingProfile = createMockExistingProfile({
        background: existingBlob,
      });
      const data = createMockProfileData({
        backgroundType: "blob",
        backgroundImageBlob: null,
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toBe(existingBlob);
    });

    it("transforms URL background", () => {
      const existingProfile = createMockExistingProfile();
      const data = createMockProfileData({
        backgroundType: "url",
        background: {
          $type: "moe.karashiiro.klink.profile#urlBackground",
          type: "url",
          value: "https://example.com/new-bg.jpg",
          objectFit: "cover",
        },
        backgroundObjectFit: "contain",
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toEqual({
        type: "url",
        value: "https://example.com/new-bg.jpg",
        objectFit: "contain",
      });
    });

    it("defaults to color when nothing matches", () => {
      const existingProfile = createMockExistingProfile();
      const data = createMockProfileData({
        backgroundType: "url", // URL type but no URL background set
        background: undefined,
        backgroundColor: "#999999",
      });

      const result = transformBackgroundForUpdate(data, existingProfile);

      expect(result).toEqual({ type: "color", value: "#999999" });
    });
  });

  describe("transformLinkIcon", () => {
    it("returns undefined for undefined input", () => {
      expect(transformLinkIcon(undefined)).toBeUndefined();
    });

    it("transforms browser Blob to blob type", () => {
      const blob = new Blob(["icon"], { type: "image/png" });

      const result = transformLinkIcon(blob);

      expect(result).toEqual({ type: "blob", value: blob });
    });

    it("transforms string URL to url type", () => {
      const result = transformLinkIcon(
        "https://example.com/icon.png" as unknown as Blob,
      );

      expect(result).toEqual({
        type: "url",
        value: "https://example.com/icon.png",
      });
    });

    it("transforms URL icon object", () => {
      const urlIcon = {
        $type: "moe.karashiiro.klink.profile#urlImage" as const,
        type: "url" as const,
        value: "https://example.com/icon.jpg",
      };

      const result = transformLinkIcon(urlIcon);

      expect(result).toEqual({
        type: "url",
        value: "https://example.com/icon.jpg",
      });
    });

    it("passes through existing ATProto blob reference", () => {
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreiicon" },
          mimeType: "image/png",
          size: 50,
        },
      };

      const result = transformLinkIcon(existingIcon);

      expect(result).toBe(existingIcon);
    });
  });

  describe("transformLinkIconForUpdate", () => {
    it("returns undefined when no icon and no existing icon", () => {
      const result = transformLinkIconForUpdate(undefined, undefined);
      expect(result).toBeUndefined();
    });

    it("transforms new icon when provided", () => {
      const newBlob = new Blob(["new icon"], { type: "image/png" });

      const result = transformLinkIconForUpdate(newBlob, undefined);

      expect(result).toEqual({ type: "blob", value: newBlob });
    });

    it("preserves existing blob icon when no new icon", () => {
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreiexisting" },
          mimeType: "image/png",
          size: 100,
        },
      };

      const result = transformLinkIconForUpdate(undefined, existingIcon);

      expect(result).toBe(existingIcon);
    });

    it("returns undefined when no new icon and existing is URL type", () => {
      const existingUrlIcon = {
        $type: "moe.karashiiro.klink.profile#urlImage" as const,
        type: "url" as const,
        value: "https://example.com/icon.png",
      };

      const result = transformLinkIconForUpdate(undefined, existingUrlIcon);

      // URL icons are not preserved, only blob icons
      expect(result).toBeUndefined();
    });

    it("prefers new icon over existing", () => {
      const newBlob = new Blob(["new"], { type: "image/jpeg" });
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: { ref: { $link: "old" }, mimeType: "image/png", size: 50 },
      };

      const result = transformLinkIconForUpdate(newBlob, existingIcon);

      expect(result).toEqual({ type: "blob", value: newBlob });
    });
  });

  describe("transformProfileForCreate", () => {
    it("transforms complete profile data", () => {
      const blob = new Blob(["profile pic"], { type: "image/png" });
      const data = createMockProfileData({
        name: "My Name",
        location: "My Location",
        bio: "My Bio",
        profileImageBlob: blob,
        backgroundType: "color",
        backgroundColor: "#123456",
        links: [
          { label: "Website", href: "https://example.com" },
          { label: "Twitter", href: "https://twitter.com/test" },
        ],
      });

      const result = transformProfileForCreate(data);

      expect(result.name).toBe("My Name");
      expect(result.location).toBe("My Location");
      expect(result.bio).toBe("My Bio");
      expect(result.profileImage).toEqual({ type: "blob", value: blob });
      expect(result.background).toEqual({ type: "color", value: "#123456" });
      expect(result.links).toHaveLength(2);
      expect(result.links[0]).toEqual({
        icon: undefined,
        label: "Website",
        href: "https://example.com",
      });
    });

    it("transforms links with icons", () => {
      const iconBlob = new Blob(["icon"], { type: "image/png" });
      const data = createMockProfileData({
        links: [{ icon: iconBlob, label: "Link", href: "https://test.com" }],
      });

      const result = transformProfileForCreate(data);

      expect(result.links[0].icon).toEqual({ type: "blob", value: iconBlob });
    });

    it("handles empty links array", () => {
      const data = createMockProfileData({ links: [] });

      const result = transformProfileForCreate(data);

      expect(result.links).toEqual([]);
    });
  });

  describe("transformProfileForUpdate", () => {
    it("falls back to create logic when no existing profile", () => {
      const data = createMockProfileData({
        backgroundType: "color",
        backgroundColor: "#abcdef",
      });

      const result = transformProfileForUpdate(
        data,
        undefined as unknown as ReturnType<typeof createMockExistingProfile>,
      );

      expect(result.background).toEqual({ type: "color", value: "#abcdef" });
    });

    it("preserves existing profile image blob when no new image", () => {
      const existingBlob = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: { ref: { $link: "existing" }, mimeType: "image/png", size: 100 },
      };
      const existingProfile = createMockExistingProfile({
        profileImage: existingBlob,
      });
      const data = createMockProfileData();

      const result = transformProfileForUpdate(data, existingProfile);

      expect(result.profileImage).toBe(existingBlob);
    });

    it("preserves existing link icons when not replaced", () => {
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: { ref: { $link: "icon-cid" }, mimeType: "image/png", size: 50 },
      };
      const existingProfile = createMockExistingProfile({
        links: [{ icon: existingIcon, label: "Link 1", href: "https://a.com" }],
      });
      const data = createMockProfileData({
        links: [{ label: "Link 1", href: "https://a.com" }], // No new icon
      });

      const result = transformProfileForUpdate(data, existingProfile);

      expect(result.links[0].icon).toBe(existingIcon);
    });

    it("replaces link icon when new blob provided", () => {
      const newIconBlob = new Blob(["new icon"], { type: "image/png" });
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: { ref: { $link: "old-cid" }, mimeType: "image/png", size: 50 },
      };
      const existingProfile = createMockExistingProfile({
        links: [{ icon: existingIcon, label: "Link", href: "https://a.com" }],
      });
      const data = createMockProfileData({
        links: [{ icon: newIconBlob, label: "Link", href: "https://a.com" }],
      });

      const result = transformProfileForUpdate(data, existingProfile);

      expect(result.links[0].icon).toEqual({
        type: "blob",
        value: newIconBlob,
      });
    });

    it("handles adding new links beyond existing ones", () => {
      const existingProfile = createMockExistingProfile({
        links: [{ label: "Existing", href: "https://existing.com" }],
      });
      const data = createMockProfileData({
        links: [
          { label: "Existing", href: "https://existing.com" },
          { label: "New Link", href: "https://new.com" },
        ],
      });

      const result = transformProfileForUpdate(data, existingProfile);

      expect(result.links).toHaveLength(2);
      expect(result.links[1]).toEqual({
        icon: undefined,
        label: "New Link",
        href: "https://new.com",
      });
    });
  });
});
