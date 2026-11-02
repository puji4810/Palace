import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[tailwindcss()],build:{outDir:'dist',rollupOptions:{output:{manualChunks:{markdown:['react-markdown','remark-gfm'],overlays:['@radix-ui/react-dialog','@radix-ui/react-popover','@radix-ui/react-tooltip']}}}},server:{host:'127.0.0.1'}});
