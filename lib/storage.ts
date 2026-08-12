export type MediaUpload = {
  uploadUrl: string;
  uploadPreset: string;
  uploadFolder: string;
};

/**
 * Cloudinary direct browser upload config (unsigned upload preset).
 *
 * The browser POSTs the raw file as multipart/form-data to `uploadUrl` with
 * `upload_preset` and `folder` set. Cloudinary responds with JSON containing
 * `secure_url`, which the client stores as the letter's mediaUrl.
 *
 * The preset must exist in the Cloudinary dashboard and allow unsigned
 * uploads, restricted to image/gif. No API secret ever reaches the browser —
 * only the cloud name and the non-secret preset name.
 */
export async function requestMediaUpload(
  _fileName: string,
  contentType: string
): Promise<MediaUpload> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const uploadUrl = `/v1_1/${cloudName}/${
    contentType.startsWith("image/") ? "image" : "auto"
  }/upload`;

  return {
    uploadUrl: `https://api.cloudinary.com${uploadUrl}`,
    uploadPreset,
    uploadFolder: "letters",
  };
}