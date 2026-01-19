export const KLINK_COLLECTION = "moe.karashiiro.klink.profile" as const;
export const KLINK_RECORD_KEY = "self" as const;

export const ATPROTO_TYPES = {
  PROFILE: "moe.karashiiro.klink.profile",
  URL_BACKGROUND: "moe.karashiiro.klink.profile#urlBackground",
  BLOB_BACKGROUND: "moe.karashiiro.klink.profile#blobBackground",
  COLOR_BACKGROUND: "moe.karashiiro.klink.profile#colorBackground",
  SHADER_BACKGROUND: "moe.karashiiro.klink.profile#shaderBackground",
  URL_IMAGE: "moe.karashiiro.klink.profile#urlImage",
  BLOB_IMAGE: "moe.karashiiro.klink.profile#blobImage",
} as const;

export const ATPROTO_ENDPOINTS = {
  UPLOAD_BLOB: "com.atproto.repo.uploadBlob",
  CREATE_RECORD: "com.atproto.repo.createRecord",
  PUT_RECORD: "com.atproto.repo.putRecord",
  DELETE_RECORD: "com.atproto.repo.deleteRecord",
} as const;
