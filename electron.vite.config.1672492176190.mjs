// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
var electron_vite_config_default = defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ["@electron-toolkit/utils"]
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        external: ["@electron-toolkit/preload"]
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [vue()]
  }
});
export {
  electron_vite_config_default as default
};
