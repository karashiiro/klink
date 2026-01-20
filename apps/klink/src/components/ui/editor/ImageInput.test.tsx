import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test/test-utils";
import { ImageInput } from "./ImageInput";

describe("ImageInput", () => {
  const defaultProps = {
    label: "Profile Image",
    urlValue: "",
    blob: null,
    onUrlChange: vi.fn(),
    onFileChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mode selection", () => {
    it("renders with URL mode by default when no blob", () => {
      renderWithProviders(<ImageInput {...defaultProps} />);

      expect(screen.getByPlaceholderText("Image URL")).toBeInTheDocument();
      expect(screen.queryByText(/Upload/i)).toBeInTheDocument();
    });

    it("renders with Upload mode when blob is provided", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "test.png" });

      renderWithProviders(<ImageInput {...defaultProps} blob={blob} />);

      // Should show file name, not URL input
      expect(screen.getByText("test.png")).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Image URL")).not.toBeInTheDocument();
    });

    it("renders with Upload mode when hasExistingBlob is true", () => {
      renderWithProviders(<ImageInput {...defaultProps} hasExistingBlob />);

      expect(screen.getByText(/Image uploaded/)).toBeInTheDocument();
    });

    it("switches to URL mode when URL button clicked", async () => {
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "test.png" });

      const { user } = renderWithProviders(
        <ImageInput {...defaultProps} blob={blob} />,
      );

      // Click URL button
      await user.click(screen.getByRole("button", { name: "URL" }));

      // URL input should now be visible
      expect(screen.getByPlaceholderText("Image URL")).toBeInTheDocument();
    });

    it("switches to Upload mode when Upload button clicked", async () => {
      const { user } = renderWithProviders(<ImageInput {...defaultProps} />);

      // Click Upload button
      await user.click(screen.getByRole("button", { name: "Upload" }));

      // File input should now be visible (no URL input)
      expect(screen.queryByPlaceholderText("Image URL")).not.toBeInTheDocument();
    });
  });

  describe("URL mode", () => {
    it("displays the current URL value", () => {
      renderWithProviders(
        <ImageInput {...defaultProps} urlValue="https://example.com/image.png" />,
      );

      expect(screen.getByDisplayValue("https://example.com/image.png")).toBeInTheDocument();
    });

    it("calls onUrlChange when URL input changes", () => {
      const onUrlChange = vi.fn();
      renderWithProviders(
        <ImageInput {...defaultProps} onUrlChange={onUrlChange} />,
      );

      const input = screen.getByPlaceholderText("Image URL");
      fireEvent.change(input, { target: { value: "https://new-url.com/img.png" } });

      expect(onUrlChange).toHaveBeenCalled();
    });

    it("uses custom placeholder when provided", () => {
      renderWithProviders(
        <ImageInput {...defaultProps} placeholder="Custom Placeholder" />,
      );

      expect(screen.getByPlaceholderText("Custom Placeholder")).toBeInTheDocument();
    });
  });

  describe("Upload mode with blob", () => {
    it("displays blob preview with filename", () => {
      const blob = new Blob(["test content"], { type: "image/jpeg" });
      Object.defineProperty(blob, "name", { value: "my-photo.jpg" });

      renderWithProviders(<ImageInput {...defaultProps} blob={blob} />);

      expect(screen.getByText("my-photo.jpg")).toBeInTheDocument();
    });

    it("displays image when previewUrl is available", async () => {
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "test.png" });

      renderWithProviders(<ImageInput {...defaultProps} blob={blob} />);

      // Preview image should render (with mocked blob URL)
      await waitFor(() => {
        expect(screen.getByAltText("Preview")).toBeInTheDocument();
      });
    });

    it("shows Clear button when blob exists and onClear is provided", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "test.png" });
      const onClear = vi.fn();

      renderWithProviders(
        <ImageInput {...defaultProps} blob={blob} onClear={onClear} />,
      );

      expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    });

    it("calls onClear when Clear button is clicked", async () => {
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "test.png" });
      const onClear = vi.fn();

      const { user } = renderWithProviders(
        <ImageInput {...defaultProps} blob={blob} onClear={onClear} />,
      );

      await user.click(screen.getByRole("button", { name: "Clear" }));

      expect(onClear).toHaveBeenCalled();
    });

    it("does not show Clear button when onClear is not provided", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      Object.defineProperty(blob, "name", { value: "test.png" });

      renderWithProviders(<ImageInput {...defaultProps} blob={blob} />);

      expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
    });
  });

  describe("Upload mode with existing blob", () => {
    it("shows uploaded indicator when hasExistingBlob is true", () => {
      renderWithProviders(<ImageInput {...defaultProps} hasExistingBlob />);

      expect(screen.getByText(/Image uploaded/)).toBeInTheDocument();
    });

    it("shows existing blob preview when existingBlobUrl is provided", () => {
      renderWithProviders(
        <ImageInput
          {...defaultProps}
          hasExistingBlob
          existingBlobUrl="https://pds.example.com/blob/123"
        />,
      );

      expect(screen.getByAltText("Preview")).toHaveAttribute(
        "src",
        "https://pds.example.com/blob/123",
      );
    });

    it("shows Remove button for existing blob when onClear is provided", () => {
      const onClear = vi.fn();

      renderWithProviders(
        <ImageInput {...defaultProps} hasExistingBlob onClear={onClear} />,
      );

      expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    it("calls onClear when Remove button is clicked", async () => {
      const onClear = vi.fn();

      const { user } = renderWithProviders(
        <ImageInput {...defaultProps} hasExistingBlob onClear={onClear} />,
      );

      await user.click(screen.getByRole("button", { name: "Remove" }));

      expect(onClear).toHaveBeenCalled();
    });
  });

  describe("file input", () => {
    it("shows file input when in Upload mode with no blob", async () => {
      const { user } = renderWithProviders(<ImageInput {...defaultProps} />);

      // Switch to Upload mode
      await user.click(screen.getByRole("button", { name: "Upload" }));

      // File input should be visible
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it("calls onFileChange when file is selected", async () => {
      const onFileChange = vi.fn();
      const { user } = renderWithProviders(
        <ImageInput {...defaultProps} onFileChange={onFileChange} />,
      );

      // Switch to Upload mode
      await user.click(screen.getByRole("button", { name: "Upload" }));

      // Find and interact with file input
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      const file = new File(["test"], "test.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(onFileChange).toHaveBeenCalled();
    });
  });

  describe("label", () => {
    it("displays the label text", () => {
      renderWithProviders(<ImageInput {...defaultProps} label="Custom Label" />);

      expect(screen.getByText("Custom Label:")).toBeInTheDocument();
    });
  });
});
