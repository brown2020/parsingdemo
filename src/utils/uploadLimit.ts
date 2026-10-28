/** Stay under the Vercel serverless request-body limit (~4.5MB), including multipart overhead. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
