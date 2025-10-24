import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";

const _blobBackgroundSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile#blobBackground"),
  ),
  /**
   * CSS object-fit property for background image
   * @default "cover"
   */
  objectFit: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literalEnum([
      "contain",
      "cover",
      "fill",
      "none",
      "scale-down",
    ]),
    "cover",
  ),
  type: /*#__PURE__*/ v.literal("blob"),
  /**
   * Blob reference to background image
   * @accept image/png, image/jpeg, image/webp, image/gif
   * @maxSize 10000000
   */
  value: /*#__PURE__*/ v.blob(),
});
const _blobImageSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile#blobImage"),
  ),
  type: /*#__PURE__*/ v.literal("blob"),
  /**
   * Blob reference to image
   * @accept image/png, image/jpeg, image/webp, image/gif
   * @maxSize 5000000
   */
  value: /*#__PURE__*/ v.blob(),
});
const _colorBackgroundSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile#colorBackground"),
  ),
  type: /*#__PURE__*/ v.literal("color"),
  /**
   * Hex color code
   * @maxLength 20
   */
  value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 20),
  ]),
});
const _linkSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile#link"),
  ),
  /**
   * Link URL
   * @maxLength 2000
   */
  href: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [
    /*#__PURE__*/ v.stringLength(0, 2000),
  ]),
  /**
   * Icon as URL or blob
   */
  get icon() {
    return /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.variant([blobImageSchema, urlImageSchema]),
    );
  },
  /**
   * Link display text
   * @maxLength 100
   */
  label: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
    /*#__PURE__*/ v.stringLength(0, 100),
  ]),
});
const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.literal("self"),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile"),
    /**
     * Background as color, URL, or blob
     */
    get background() {
      return /*#__PURE__*/ v.variant([
        blobBackgroundSchema,
        colorBackgroundSchema,
        urlBackgroundSchema,
      ]);
    },
    /**
     * Bio text (empty string if not set)
     * @maxLength 500
     * @default ""
     */
    bio: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 500),
      ]),
      "",
    ),
    /**
     * Array of links
     */
    get links() {
      return /*#__PURE__*/ v.array(linkSchema);
    },
    /**
     * Location text
     * @maxLength 100
     */
    location: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 100),
      ]),
    ),
    /**
     * Display name
     * @maxLength 100
     */
    name: /*#__PURE__*/ v.optional(
      /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.string(), [
        /*#__PURE__*/ v.stringLength(0, 100),
      ]),
    ),
    /**
     * Profile image as URL or blob
     */
    get profileImage() {
      return /*#__PURE__*/ v.optional(
        /*#__PURE__*/ v.variant([blobImageSchema, urlImageSchema]),
      );
    },
  }),
);
const _urlBackgroundSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile#urlBackground"),
  ),
  /**
   * CSS object-fit property for background image
   * @default "cover"
   */
  objectFit: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literalEnum([
      "contain",
      "cover",
      "fill",
      "none",
      "scale-down",
    ]),
    "cover",
  ),
  type: /*#__PURE__*/ v.literal("url"),
  /**
   * Background image URL
   * @maxLength 2000
   */
  value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [
    /*#__PURE__*/ v.stringLength(0, 2000),
  ]),
});
const _urlImageSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("moe.karashiiro.klink.profile#urlImage"),
  ),
  type: /*#__PURE__*/ v.literal("url"),
  /**
   * Image URL
   * @maxLength 2000
   */
  value: /*#__PURE__*/ v.constrain(/*#__PURE__*/ v.genericUriString(), [
    /*#__PURE__*/ v.stringLength(0, 2000),
  ]),
});

type blobBackground$schematype = typeof _blobBackgroundSchema;
type blobImage$schematype = typeof _blobImageSchema;
type colorBackground$schematype = typeof _colorBackgroundSchema;
type link$schematype = typeof _linkSchema;
type main$schematype = typeof _mainSchema;
type urlBackground$schematype = typeof _urlBackgroundSchema;
type urlImage$schematype = typeof _urlImageSchema;

export interface blobBackgroundSchema extends blobBackground$schematype {}
export interface blobImageSchema extends blobImage$schematype {}
export interface colorBackgroundSchema extends colorBackground$schematype {}
export interface linkSchema extends link$schematype {}
export interface mainSchema extends main$schematype {}
export interface urlBackgroundSchema extends urlBackground$schematype {}
export interface urlImageSchema extends urlImage$schematype {}

export const blobBackgroundSchema =
  _blobBackgroundSchema as blobBackgroundSchema;
export const blobImageSchema = _blobImageSchema as blobImageSchema;
export const colorBackgroundSchema =
  _colorBackgroundSchema as colorBackgroundSchema;
export const linkSchema = _linkSchema as linkSchema;
export const mainSchema = _mainSchema as mainSchema;
export const urlBackgroundSchema = _urlBackgroundSchema as urlBackgroundSchema;
export const urlImageSchema = _urlImageSchema as urlImageSchema;

export interface BlobBackground
  extends v.InferInput<typeof blobBackgroundSchema> {}
export interface BlobImage extends v.InferInput<typeof blobImageSchema> {}
export interface ColorBackground
  extends v.InferInput<typeof colorBackgroundSchema> {}
export interface Link extends v.InferInput<typeof linkSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}
export interface UrlBackground
  extends v.InferInput<typeof urlBackgroundSchema> {}
export interface UrlImage extends v.InferInput<typeof urlImageSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "moe.karashiiro.klink.profile": mainSchema;
  }
}
