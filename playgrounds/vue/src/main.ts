import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import '@/style.css'

async function prepareMocks() {
  const { worker } = await import('./mocks/browser')
  return worker.start()
}

function initApp() {
  createApp(App)
    .use(router)
    .use(VueQueryPlugin)
    .mount('#app')
}

async function bootstrap() {
  await prepareMocks()
  initApp()
}

bootstrap().catch((error) => {
  console.error('App could not be bootstraped')
  console.error(error)
})
