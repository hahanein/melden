import {resolve} from "node:path";
import {defineConfig} from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/main.ts"),
			name: "Melden",
			fileName: "melden",
		},
		rollupOptions: {
			external: ["react", "react/jsx-runtime", "framer-motion"],
		},
	},
});
