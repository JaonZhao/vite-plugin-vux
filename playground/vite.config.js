import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
import vux from "../src/index";
// import vux from "../src/index2"

export default defineConfig({
  plugins: [
    vue(),
    // vux({
    //   plugins: [{
    //     name: "vux-ui",
    //   }]
    // }),
  ],
});