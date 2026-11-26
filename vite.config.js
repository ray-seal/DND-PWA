import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';

const pages=process.env.GITHUB_PAGES==='true';
const base=pages?'/DND-PWA/':'/';

export default defineConfig({
  base,
  plugins:[
    react(),
    VitePWA({
      registerType:'autoUpdate',
      includeAssets:['icons/icon-192.png','icons/icon-512.png'],
      manifest:{
        id:base,
        name:'StoryFoundry - AI Adventures',
        short_name:'StoryFoundry',
        start_url:base,
        scope:base,
        display:'standalone',
        orientation:'portrait-primary',
        background_color:'#101116',
        theme_color:'#101116',
        description:'Choose an experience. Let the AI build the world.',
        categories:['games','entertainment'],
        icons:[
          {src:base+'icons/icon-192.png',sizes:'192x192',type:'image/png'},
          {src:base+'icons/icon-512.png',sizes:'512x512',type:'image/png'}
        ]
      },
      workbox:{
        cleanupOutdatedCaches:true,
        clientsClaim:true,
        navigateFallback:base+'index.html',
        navigateFallbackDenylist:[/^\/api\//],
        globPatterns:['**/*.{js,css,html,ico,png,svg,webmanifest,woff2}'],
        runtimeCaching:[
          {
            urlPattern:/^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler:'CacheFirst',
            options:{
              cacheName:'storyfoundry-fonts',
              expiration:{maxEntries:20,maxAgeSeconds:60*60*24*365}
            }
          }
        ]
      }
    })
  ]
});
