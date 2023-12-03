import {resolve} from "node:path";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		lib: {
			entry: resolve(__dirname, "src/main.ts"),
			name: "Melden",
			fileName: "melden",
		},
		rollupOptions: {
			external: ["react", "react-dom", "framer-motion"],
		},
	},
});
