import { describe, it, expect, beforeEach } from "vitest";
import { createStore } from "jotai";
import {
  profileAtom,
  nameAtom,
  locationAtom,
  bioAtom,
  profileImageAtom,
  profileImageBlobAtom,
  backgroundAtom,
  backgroundImageBlobAtom,
  backgroundColorAtom,
  backgroundTypeAtom,
  backgroundObjectFitAtom,
  backgroundShaderCodeAtom,
  linksAtom,
  primaryColorAtom,
  secondaryColorAtom,
  fontFamilyAtom,
  stylesheetAtom,
  logoModeAtom,
  editorPanelsOpenAtom,
  mobileActivePanelAtom,
  currentProfileAtom,
  profileLoadingAtom,
  linkMetadataAtom,
} from "./profile";
import { DEFAULT_COLORS } from "../constants";

describe("profile atoms", () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe("profileAtom", () => {
    it("has correct default values", () => {
      const profile = store.get(profileAtom);

      expect(profile.name).toBe("");
      expect(profile.location).toBe("");
      expect(profile.bio).toBe("");
      expect(profile.profileImage).toBeUndefined();
      expect(profile.profileImageBlob).toBeNull();
      expect(profile.background).toBeUndefined();
      expect(profile.backgroundImageBlob).toBeNull();
      expect(profile.backgroundImageUrl).toBe("");
      expect(profile.backgroundColor).toBe(DEFAULT_COLORS.BACKGROUND);
      expect(profile.backgroundShaderCode).toBe("");
      expect(profile.backgroundType).toBe("color");
      expect(profile.backgroundObjectFit).toBe("cover");
      expect(profile.theme.primaryColor).toBe(DEFAULT_COLORS.PRIMARY);
      expect(profile.theme.secondaryColor).toBe(DEFAULT_COLORS.SECONDARY);
      expect(profile.theme.fontFamily).toBe("");
      expect(profile.theme.stylesheet).toBe("");
      expect(profile.links).toEqual([]);
      expect(profile.logoMode).toBe("none");
    });

    it("can be updated", () => {
      store.set(profileAtom, {
        ...store.get(profileAtom),
        name: "Test Name",
        bio: "Test Bio",
      });

      const profile = store.get(profileAtom);
      expect(profile.name).toBe("Test Name");
      expect(profile.bio).toBe("Test Bio");
    });
  });

  describe("derived text atoms", () => {
    describe("nameAtom", () => {
      it("reads from profileAtom", () => {
        store.set(profileAtom, {
          ...store.get(profileAtom),
          name: "Test Name",
        });
        expect(store.get(nameAtom)).toBe("Test Name");
      });

      it("writes to profileAtom", () => {
        store.set(nameAtom, "New Name");
        expect(store.get(profileAtom).name).toBe("New Name");
      });

      it("preserves other fields when writing", () => {
        store.set(profileAtom, {
          ...store.get(profileAtom),
          name: "Original",
          bio: "Original Bio",
        });
        store.set(nameAtom, "Updated Name");

        expect(store.get(profileAtom).name).toBe("Updated Name");
        expect(store.get(profileAtom).bio).toBe("Original Bio");
      });
    });

    describe("locationAtom", () => {
      it("reads from profileAtom", () => {
        store.set(profileAtom, {
          ...store.get(profileAtom),
          location: "Test Location",
        });
        expect(store.get(locationAtom)).toBe("Test Location");
      });

      it("writes to profileAtom", () => {
        store.set(locationAtom, "New Location");
        expect(store.get(profileAtom).location).toBe("New Location");
      });
    });

    describe("bioAtom", () => {
      it("reads from profileAtom", () => {
        store.set(profileAtom, { ...store.get(profileAtom), bio: "Test Bio" });
        expect(store.get(bioAtom)).toBe("Test Bio");
      });

      it("writes to profileAtom", () => {
        store.set(bioAtom, "New Bio");
        expect(store.get(profileAtom).bio).toBe("New Bio");
      });
    });
  });

  describe("read-only derived atoms", () => {
    describe("profileImageAtom", () => {
      it("reads profileImage from profileAtom", () => {
        const image = {
          $type: "moe.karashiiro.klink.profile#urlImage" as const,
          type: "url" as const,
          value: "https://example.com/avatar.jpg",
        };
        store.set(profileAtom, {
          ...store.get(profileAtom),
          profileImage: image,
        });
        expect(store.get(profileImageAtom)).toBe(image);
      });
    });

    describe("profileImageBlobAtom", () => {
      it("reads profileImageBlob from profileAtom", () => {
        const blob = new Blob(["test"], { type: "image/png" });
        store.set(profileAtom, {
          ...store.get(profileAtom),
          profileImageBlob: blob,
        });
        expect(store.get(profileImageBlobAtom)).toBe(blob);
      });
    });

    describe("backgroundAtom", () => {
      it("reads background from profileAtom", () => {
        const background = {
          $type: "moe.karashiiro.klink.profile#colorBackground" as const,
          type: "color" as const,
          value: "#ff0000",
        };
        store.set(profileAtom, { ...store.get(profileAtom), background });
        expect(store.get(backgroundAtom)).toBe(background);
      });
    });
  });

  describe("focusAtom derived atoms", () => {
    describe("backgroundImageBlobAtom", () => {
      it("reads and writes backgroundImageBlob", () => {
        const blob = new Blob(["bg"], { type: "image/jpeg" });
        store.set(backgroundImageBlobAtom, blob);
        expect(store.get(backgroundImageBlobAtom)).toBe(blob);
        expect(store.get(profileAtom).backgroundImageBlob).toBe(blob);
      });
    });

    describe("backgroundColorAtom", () => {
      it("reads and writes backgroundColor", () => {
        store.set(backgroundColorAtom, "#ff5500");
        expect(store.get(backgroundColorAtom)).toBe("#ff5500");
        expect(store.get(profileAtom).backgroundColor).toBe("#ff5500");
      });
    });

    describe("backgroundTypeAtom", () => {
      it("reads and writes backgroundType", () => {
        store.set(backgroundTypeAtom, "shader");
        expect(store.get(backgroundTypeAtom)).toBe("shader");
        expect(store.get(profileAtom).backgroundType).toBe("shader");
      });

      it("accepts all valid background types", () => {
        const types = ["color", "url", "blob", "shader"] as const;
        types.forEach((type) => {
          store.set(backgroundTypeAtom, type);
          expect(store.get(backgroundTypeAtom)).toBe(type);
        });
      });
    });

    describe("backgroundObjectFitAtom", () => {
      it("reads and writes backgroundObjectFit", () => {
        store.set(backgroundObjectFitAtom, "contain");
        expect(store.get(backgroundObjectFitAtom)).toBe("contain");
      });

      it("accepts all valid objectFit values", () => {
        const fits = [
          "cover",
          "contain",
          "fill",
          "scale-down",
          "none",
        ] as const;
        fits.forEach((fit) => {
          store.set(backgroundObjectFitAtom, fit);
          expect(store.get(backgroundObjectFitAtom)).toBe(fit);
        });
      });
    });

    describe("backgroundShaderCodeAtom", () => {
      it("reads and writes backgroundShaderCode", () => {
        const shaderCode = "void main() { gl_FragColor = vec4(1.0); }";
        store.set(backgroundShaderCodeAtom, shaderCode);
        expect(store.get(backgroundShaderCodeAtom)).toBe(shaderCode);
      });
    });

    describe("theme atoms", () => {
      it("primaryColorAtom reads and writes", () => {
        store.set(primaryColorAtom, "#123456");
        expect(store.get(primaryColorAtom)).toBe("#123456");
        expect(store.get(profileAtom).theme.primaryColor).toBe("#123456");
      });

      it("secondaryColorAtom reads and writes", () => {
        store.set(secondaryColorAtom, "#abcdef");
        expect(store.get(secondaryColorAtom)).toBe("#abcdef");
        expect(store.get(profileAtom).theme.secondaryColor).toBe("#abcdef");
      });

      it("fontFamilyAtom reads and writes", () => {
        store.set(fontFamilyAtom, "Comic Sans MS");
        expect(store.get(fontFamilyAtom)).toBe("Comic Sans MS");
      });

      it("stylesheetAtom reads and writes", () => {
        const css = ".custom { color: red; }";
        store.set(stylesheetAtom, css);
        expect(store.get(stylesheetAtom)).toBe(css);
      });
    });

    describe("logoModeAtom", () => {
      it("reads and writes logoMode", () => {
        store.set(logoModeAtom, "show");
        expect(store.get(logoModeAtom)).toBe("show");

        store.set(logoModeAtom, "none");
        expect(store.get(logoModeAtom)).toBe("none");
      });
    });
  });

  describe("linksAtom", () => {
    it("reads and writes links array", () => {
      const links = [
        { label: "Website", href: "https://example.com" },
        { label: "Twitter", href: "https://twitter.com/test" },
      ];
      store.set(linksAtom, links);

      expect(store.get(linksAtom)).toEqual(links);
      expect(store.get(profileAtom).links).toEqual(links);
    });

    it("handles links with icons", () => {
      const blob = new Blob(["icon"], { type: "image/png" });
      const links = [{ icon: blob, label: "Link", href: "https://test.com" }];
      store.set(linksAtom, links);

      expect(store.get(linksAtom)[0].icon).toBe(blob);
    });

    it("handles empty links array", () => {
      store.set(linksAtom, [{ label: "A", href: "B" }]);
      store.set(linksAtom, []);
      expect(store.get(linksAtom)).toEqual([]);
    });
  });

  describe("UI state atoms", () => {
    describe("editorPanelsOpenAtom", () => {
      it("defaults to true", () => {
        expect(store.get(editorPanelsOpenAtom)).toBe(true);
      });

      it("can be toggled", () => {
        store.set(editorPanelsOpenAtom, false);
        expect(store.get(editorPanelsOpenAtom)).toBe(false);
      });
    });

    describe("mobileActivePanelAtom", () => {
      it("defaults to left", () => {
        expect(store.get(mobileActivePanelAtom)).toBe("left");
      });

      it("can be set to right", () => {
        store.set(mobileActivePanelAtom, "right");
        expect(store.get(mobileActivePanelAtom)).toBe("right");
      });
    });

    describe("currentProfileAtom", () => {
      it("defaults to null", () => {
        expect(store.get(currentProfileAtom)).toBeNull();
      });

      it("can store profile data", () => {
        const profile = {
          uri: "at://did:plc:test/moe.karashiiro.klink.profile/self",
          cid: "bafyreicid",
          value: {
            $type: "moe.karashiiro.klink.profile" as const,
            bio: "Test bio",
            background: {
              $type: "moe.karashiiro.klink.profile#colorBackground" as const,
              type: "color" as const,
              value: "#000",
            },
            theme: { primaryColor: "#fff", secondaryColor: "#000" },
            links: [],
            logoMode: "none" as const,
          },
        };
        store.set(currentProfileAtom, profile);
        expect(store.get(currentProfileAtom)).toBe(profile);
      });
    });

    describe("profileLoadingAtom", () => {
      it("defaults to false", () => {
        expect(store.get(profileLoadingAtom)).toBe(false);
      });

      it("can be set to true", () => {
        store.set(profileLoadingAtom, true);
        expect(store.get(profileLoadingAtom)).toBe(true);
      });
    });
  });

  describe("linkMetadataAtom", () => {
    it("returns empty array when no links", () => {
      expect(store.get(linkMetadataAtom)).toEqual([]);
    });

    it("returns metadata for each link", () => {
      store.set(linksAtom, [
        { label: "Link 1", href: "https://1.com" },
        { label: "Link 2", href: "https://2.com" },
      ]);

      const metadata = store.get(linkMetadataAtom);
      expect(metadata).toHaveLength(2);
    });

    it("detects existing blob icon when no new icon provided", () => {
      // Set up current profile with blob icon
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: {
          ref: { $link: "bafyreicid" },
          mimeType: "image/png",
          size: 100,
        },
      };
      store.set(currentProfileAtom, {
        uri: "at://...",
        cid: "bafyrei...",
        value: {
          $type: "moe.karashiiro.klink.profile" as const,
          bio: "",
          background: {
            $type: "moe.karashiiro.klink.profile#colorBackground" as const,
            type: "color" as const,
            value: "#000",
          },
          theme: { primaryColor: "", secondaryColor: "" },
          links: [{ icon: existingIcon, label: "Link", href: "https://a.com" }],
          logoMode: "none" as const,
        },
      });

      // Set links without new icon blob
      store.set(linksAtom, [{ label: "Link", href: "https://a.com" }]);

      const metadata = store.get(linkMetadataAtom);
      expect(metadata[0].hasExistingBlobIcon).toBe(true);
      expect(metadata[0].existingIcon).toBe(existingIcon);
    });

    it("does not flag hasExistingBlobIcon when new Blob is provided", () => {
      const existingIcon = {
        $type: "moe.karashiiro.klink.profile#blobImage" as const,
        type: "blob" as const,
        value: { ref: { $link: "cid" }, mimeType: "image/png", size: 50 },
      };
      store.set(currentProfileAtom, {
        uri: "at://...",
        cid: "bafyrei...",
        value: {
          $type: "moe.karashiiro.klink.profile" as const,
          bio: "",
          background: {
            $type: "moe.karashiiro.klink.profile#colorBackground" as const,
            type: "color" as const,
            value: "#000",
          },
          theme: { primaryColor: "", secondaryColor: "" },
          links: [{ icon: existingIcon, label: "Link", href: "https://a.com" }],
          logoMode: "none" as const,
        },
      });

      // Set links WITH new icon blob
      const newBlob = new Blob(["new"], { type: "image/png" });
      store.set(linksAtom, [
        { icon: newBlob, label: "Link", href: "https://a.com" },
      ]);

      const metadata = store.get(linkMetadataAtom);
      expect(metadata[0].hasExistingBlobIcon).toBe(false);
    });

    it("handles URL icons (not blob)", () => {
      const urlIcon = {
        $type: "moe.karashiiro.klink.profile#urlImage" as const,
        type: "url" as const,
        value: "https://example.com/icon.png",
      };
      store.set(currentProfileAtom, {
        uri: "at://...",
        cid: "bafyrei...",
        value: {
          $type: "moe.karashiiro.klink.profile" as const,
          bio: "",
          background: {
            $type: "moe.karashiiro.klink.profile#colorBackground" as const,
            type: "color" as const,
            value: "#000",
          },
          theme: { primaryColor: "", secondaryColor: "" },
          links: [{ icon: urlIcon, label: "Link", href: "https://a.com" }],
          logoMode: "none" as const,
        },
      });

      store.set(linksAtom, [{ label: "Link", href: "https://a.com" }]);

      const metadata = store.get(linkMetadataAtom);
      // URL icons don't count as "existing blob icons"
      expect(metadata[0].hasExistingBlobIcon).toBe(false);
    });
  });
});
