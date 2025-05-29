import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'
import compression from 'vite-plugin-compression2'

// Custom plugin for caching headers and performance optimizations
const performancePlugin = () => ({
  name: 'performance-plugin',
  configureServer(server) {
    return () => {
      server.middlewares.use((req, res, next) => {
        // Add performance headers
        if (req.url.includes('.js') || req.url.includes('.css') || req.url.includes('.woff2')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('Timing-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Origin', '*');
        } else if (req.url.includes('/api/')) {
          res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
        next();
      });
    };
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Use the automatic runtime
      jsxRuntime: 'automatic'
    }),
    splitVendorChunkPlugin(),
    performancePlugin(),
    compression({
      include: [/\.(js|mjs|json|css|html)$/i],
      skipIfLargerOrEqual: true,
      threshold: 1025,
      algorithm: 'gzip'
    })
  ],
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('react-slick') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            if (id.includes('axios') || id.includes('tanstack')) {
              return 'vendor-data';
            }
            return 'vendor-deps';
          }
        }
      }
    },
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    sourcemap: false, // Disable sourcemaps in production
    assetsInlineLimit: 4096, // Inline assets < 4kb
    emptyOutDir: true,
    write: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'react-slick',
      'axios',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.ditq.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Accept-Encoding', 'br, gzip');
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'interest-cohort=()'
    }
  }
})