import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import vux from "../src/index";

export default defineConfig({
  plugins: [
    vue(),
    vux(),
  ],
});