import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ command, mode }) => {
  // Android 8 devices can be stuck on an older, but still updatable, WebView.
  // The Android bundle is transpiled down to Chrome 87 while desktop builds
  // keep the current baseline.
  const buildTarget = mode === "android" ? "chrome87" : "chrome130";

  return {
    base: command === "build" ? "./" : "/",
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      ...(process.env.ANALYZE
        ? [
            visualizer({
              filename: "build/stats.html",
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],
    server: {
      port: 3000,
      host: "127.0.0.1",
      strictPort: false,
      warmup: {
        clientFiles: [
          "./src/index.tsx",
          "./src/router/index.tsx",
          "./src/pages/manager/index.tsx",
          "./src/pages/reader/index.tsx",
          "./src/pages/login/index.tsx",
        ],
      },
    },
    build: {
      outDir: "build",
      assetsDir: "static",
      sourcemap: false,
      target: buildTarget,
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("assets/lib/kookit")) {
              return "kookit";
            }
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
    json: {
      namedExports: false,
    },
    optimizeDeps: {
      include: [
        "buffer",
        "axios",
        "crypto-js",
        "megajs",
        "sse.js",
        "webdav/dist/web/index.js",
        "@aws-sdk/client-s3",
        "chardet",
        "fflate",
        "js-untar",
        "jszip",
        "mammoth",
        "marked",
        "mhtml2html",
        "rangy/lib/rangy-core.js",
        "rangy/lib/rangy-textrange",
        "underscore",
        "liteofd",
        "@web-ppt/core",
      ],
      esbuildOptions: {
        target: buildTarget,
      },
    },
  };
});
