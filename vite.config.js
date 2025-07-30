import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.js",
      name: "OrgChart",
      fileName: "d3-org-chart",
      formats: ["es"],
    },
    minify: true,
    rollupOptions: {
      // Don't externalize dependencies to include them in the bundle
      external: [],
      output: {
        // Configure global variables for when the script is included via <script> tag
        globals: {
          // No need for globals as we're bundling everything
        },
        // Make the UMD build have a .min.js extension
        entryFileNames: "d3-org-chart.min.js",
      },
    },
  },
});
