import { defineConfig } from "vite";

export default defineConfig({
  base: "/forcecrusher/",
  plugins: [
    {
      name: "add-analytics-script",
      apply: "build", // ensures the plugin runs only during the build command
      transformIndexHtml() {
        return {
          tags: [
            {
              tag: "script",
              attrs: {
                async: true,
                src: "https://cloud.umami.is/script.js",
                "data-website-id": "830512db-3c4e-43ab-bc78-1785bc87ef2f",
              },
              injectTo: "head",
            },
          ],
        };
      },
    },
  ],
});
