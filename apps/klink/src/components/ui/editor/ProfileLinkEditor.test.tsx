import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { createStore } from "jotai";
import { renderWithProviders } from "../../../test/test-utils";
import { ProfileLinkEditor } from "./ProfileLinkEditor";
import { linksAtom, currentProfileAtom } from "../../../atoms/profile";

// Mock LinkItem since it has complex dependencies
vi.mock("./LinkItem", () => ({
  LinkItem: ({
    onRemove,
    onClearIcon,
  }: {
    onRemove: () => void;
    onClearIcon?: () => void;
  }) => (
    <div data-testid="link-item">
      <button onClick={onRemove}>Remove</button>
      {onClearIcon && <button onClick={onClearIcon}>Clear Icon</button>}
    </div>
  ),
}));

describe("ProfileLinkEditor", () => {
  describe("basic rendering", () => {
    it("renders links count header", () => {
      const store = createStore();

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.getByText("Links (0)")).toBeInTheDocument();
    });

    it("renders add link button", () => {
      const store = createStore();

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.getByRole("button", { name: "+ Add Link" })).toBeInTheDocument();
    });

    it("displays correct link count", () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link 1", href: "https://link1.com", icon: undefined },
        { label: "Link 2", href: "https://link2.com", icon: undefined },
        { label: "Link 3", href: "https://link3.com", icon: undefined },
      ]);

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.getByText("Links (3)")).toBeInTheDocument();
    });
  });

  describe("adding links", () => {
    it("adds a new link when Add Link button clicked", async () => {
      const store = createStore();
      store.set(linksAtom, []);

      const { user } = renderWithProviders(<ProfileLinkEditor />, { store });

      await user.click(screen.getByRole("button", { name: "+ Add Link" }));

      expect(store.get(linksAtom)).toHaveLength(1);
      expect(store.get(linksAtom)[0]).toEqual({
        icon: undefined,
        label: "",
        href: "",
      });
    });

    it("adds link to end of existing links", async () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Existing", href: "https://existing.com", icon: undefined },
      ]);

      const { user } = renderWithProviders(<ProfileLinkEditor />, { store });

      await user.click(screen.getByRole("button", { name: "+ Add Link" }));

      expect(store.get(linksAtom)).toHaveLength(2);
      expect(store.get(linksAtom)[0].label).toBe("Existing");
      expect(store.get(linksAtom)[1].label).toBe("");
    });
  });

  describe("removing links", () => {
    it("removes link when remove callback is called", async () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link 1", href: "https://link1.com", icon: undefined },
        { label: "Link 2", href: "https://link2.com", icon: undefined },
      ]);

      const { user } = renderWithProviders(<ProfileLinkEditor />, { store });

      const removeButtons = screen.getAllByRole("button", { name: "Remove" });
      await user.click(removeButtons[0]);

      expect(store.get(linksAtom)).toHaveLength(1);
      expect(store.get(linksAtom)[0].label).toBe("Link 2");
    });

    it("removes correct link from middle", async () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link 1", href: "https://link1.com", icon: undefined },
        { label: "Link 2", href: "https://link2.com", icon: undefined },
        { label: "Link 3", href: "https://link3.com", icon: undefined },
      ]);

      const { user } = renderWithProviders(<ProfileLinkEditor />, { store });

      const removeButtons = screen.getAllByRole("button", { name: "Remove" });
      await user.click(removeButtons[1]); // Remove middle link

      expect(store.get(linksAtom)).toHaveLength(2);
      expect(store.get(linksAtom)[0].label).toBe("Link 1");
      expect(store.get(linksAtom)[1].label).toBe("Link 3");
    });
  });

  describe("clearing icons", () => {
    it("shows clear icon option when profile exists", () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link", href: "https://link.com", icon: undefined },
      ]);
      store.set(currentProfileAtom, {
        uri: "at://did:plc:test/moe.karashiror.klink.profile/self",
        cid: "abc123",
        value: {
          $type: "moe.karashiror.klink.profile",
          bio: "Test",
          background: { type: "color", value: "#000" },
          links: [],
        },
      });

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.getByRole("button", { name: "Clear Icon" })).toBeInTheDocument();
    });

    it("does not show clear icon option when no profile", () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link", href: "https://link.com", icon: undefined },
      ]);
      store.set(currentProfileAtom, null);

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.queryByRole("button", { name: "Clear Icon" })).not.toBeInTheDocument();
    });

    it("clears icon when clear icon callback is called", async () => {
      const store = createStore();
      store.set(linksAtom, [
        {
          label: "Link",
          href: "https://link.com",
          icon: {
            $type: "moe.karashiror.klink.profile#urlImage" as const,
            type: "url" as const,
            value: "https://icon.com" as `${string}:${string}`,
          },
        },
      ]);
      store.set(currentProfileAtom, {
        uri: "at://did:plc:test/moe.karashiror.klink.profile/self",
        cid: "abc123",
        value: {
          $type: "moe.karashiror.klink.profile",
          bio: "Test",
          background: { type: "color", value: "#000" },
          links: [],
        },
      });

      const { user } = renderWithProviders(<ProfileLinkEditor />, { store });

      await user.click(screen.getByRole("button", { name: "Clear Icon" }));

      expect(store.get(linksAtom)[0].icon).toBeUndefined();
    });
  });

  describe("rendering link items", () => {
    it("renders LinkItem for each link", () => {
      const store = createStore();
      store.set(linksAtom, [
        { label: "Link 1", href: "https://link1.com", icon: undefined },
        { label: "Link 2", href: "https://link2.com", icon: undefined },
      ]);

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.getAllByTestId("link-item")).toHaveLength(2);
    });

    it("renders no link items when empty", () => {
      const store = createStore();
      store.set(linksAtom, []);

      renderWithProviders(<ProfileLinkEditor />, { store });

      expect(screen.queryByTestId("link-item")).not.toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("handles rapid add/remove operations", async () => {
      const store = createStore();
      store.set(linksAtom, []);

      const { user } = renderWithProviders(<ProfileLinkEditor />, { store });

      // Add multiple links
      await user.click(screen.getByRole("button", { name: "+ Add Link" }));
      await user.click(screen.getByRole("button", { name: "+ Add Link" }));
      await user.click(screen.getByRole("button", { name: "+ Add Link" }));

      expect(store.get(linksAtom)).toHaveLength(3);

      // Remove one
      const removeButtons = screen.getAllByRole("button", { name: "Remove" });
      await user.click(removeButtons[1]);

      expect(store.get(linksAtom)).toHaveLength(2);
    });
  });
});
