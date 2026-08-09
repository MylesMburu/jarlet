export type MediaUpload = {
  key: string;
  uploadUrl: string;
  publicUrl: string;
};

/**
 * Stub for the media provider (R2/S3 presigned direct uploads).
 * Returns a fake upload URL — wire real credentials later in this file.
 * The generated key format is preserved so the real implementation
 * can drop in without changing callers.
 */
export async function requestMediaUpload(
  fileName: string,
  _contentType: string
): Promise<MediaUpload> {
  const ext = (fileName.split(".").pop() ?? "").toLowerCase() || "bin";
  const key = `letters/${crypto.randomUUID()}-${Date.now()}.${ext}`;
  const bucket =
    process.env.R2_BUCKET ??
    (process.env.NODE_ENV === "production"
      ? "letter-jar"
      : "letter-jar-dev");

  return {
    key,
    uploadUrl: `https://${bucket}.stub.local/${key}?presign=stub`,
    publicUrl: `https://${bucket}.stub.local/${key}`,
  };
}
