import { existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

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

export default nextConfig;
