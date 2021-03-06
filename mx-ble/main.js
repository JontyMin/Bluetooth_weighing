import Vue from 'vue'
import App from './App'

import http from './common/http.js'

import store from '@/store';

import cuCustom from './components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)

import drawerSettings from './components/drawer-settings.vue'
Vue.component('drawer-settings', drawerSettings)

import bluetooth from './components/bluetooth.vue'
Vue.component('bluetooth', bluetooth)

Vue.config.productionTip = false

Vue.prototype.$store=store;
Vue.prototype.http=http;
App.mpType = 'app'

const app = new Vue({
	...App,
	store
})
app.$mount()

