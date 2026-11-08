import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { quantityHistoryTracker } from './services/historyTracker.js'; // quantity-history-feature

var app = createApp(App)

app.use(createPinia())
app.use(router)
quantityHistoryTracker.start();
app.mount('#app')
