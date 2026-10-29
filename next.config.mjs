/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
    "puppeteer",
    "@sparticuz/chromium",
    "@kenjiuno/msgreader",
  ],
  // pdfjs polyfills DOMMatrix from this native package. The require is dynamic,
  // so the Linux binary has to be traced explicitly or Vercel omits it.
  outputFileTracingIncludes: {
    "/api/convertPdfToText": [
      "./node_modules/@napi-rs/canvas/**/*",
      "./node_modules/@napi-rs/canvas-linux-x64-gnu/**/*",
    ],
    "/documents": [
      "./node_modules/@napi-rs/canvas/**/*",
      "./node_modules/@napi-rs/canvas-linux-x64-gnu/**/*",
    ],
  },
};

export default nextConfig;
