import { existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";
import bundleAnalyzer from "@next/bundle-analyzer";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const devtoolsPath = resolve(__dirname, "app/agentation-devtools.tsx");
const devtoolsAlias = existsSync(devtoolsPath)
  ? "./app/agentation-devtools.tsx"
  : "./app/agentation-stub.tsx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  // In dev mode, Next.js doesn't resolve public/labs/*/index.html for
  // directory-style URLs the way Vercel's static serving does. This rewrite
  // bridges that gap so "Open live ↗" works on localhost too.
  // (Rewrites have no effect on the static export output.)
  async rewrites() {
    return [
      {
        source: "/labs/:slug/",
        destination: "/labs/:slug/index.html",
      },
    ];
  },
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
  turbopack: {
    resolveAlias: {
      "#agentation-devtools": devtoolsAlias,
    },
  },
};

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "1", openAnalyzer: false });

export default withBundleAnalyzer(nextConfig);
