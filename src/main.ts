import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// MSWの起動後、アプリをmountする
// if (process.env.NODE_ENV === 'msw_start') {
//   const {worker} = await import('./mock_server/browser.js');
//   await worker.start({
//     onUnhandledRequest: 'bypass',
//     serviceWorker: {
//       url: '/web/mockServiceWorker.js'
//     }
//   })
//   .catch(error => {
//     console.error('MSWの起動に失敗しました。', error);
//     throw error;
//   });
//   console.debug('MSWが正常に起動しました。');
// }

app.mount('#app')
