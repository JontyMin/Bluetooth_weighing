import Vue from 'vue'
import Vuex from 'vuex'
import bluetooth from './module/bluetooth'
Vue.use(Vuex)

let lifeData = {};

try {
	// 尝试获取本地是否存在lifeData变量，第一次启动APP时是不存在的
	lifeData = uni.getStorageSync('lifeData');
} catch (e) {

}

// 需要永久存储，且下次APP启动需要取出的，在state中的变量名
let saveStateKeys = ['vuex_hasLogin', 'vuex_token'];

// 保存变量到本地存储中
const saveLifeData = function(key, value) {
	// 判断变量名是否在需要存储的数组中
	if (saveStateKeys.indexOf(key) != -1) {
		// 获取本地存储的lifeData对象，将变量添加到对象中
		let tmp = uni.getStorageSync('lifeData');
		// 第一次打开APP，不存在lifeData变量，故放一个{}空对象
		tmp = tmp ? tmp : {};
		tmp[key] = value;
		// 执行这一步后，所有需要存储的变量，都挂载在本地的lifeData对象中
		uni.setStorageSync('lifeData', tmp);
	}
}


export default new Vuex.Store({
	state: {
		forcedLogin: true, //是否需要强制登录
		vuex_hasLogin: lifeData.vuex_hasLogin ? lifeData.vuex_hasLogin :false,
		vuex_token: lifeData.vuex_token ? lifeData.vuex_token : "",
		
	},
	mutations: {
		login(state, payload) {
			
			state['vuex_hasLogin']=true;
			saveLifeData('vuex_hasLogin', state['vuex_hasLogin'])
			
			state['vuex_token']=payload;
			saveLifeData('vuex_token', state['vuex_token'])
			
			console.log(payload)
		
		},
		logout(state) {
			state.vuex_hasLogin = false;
			state.vuex_token = '';
			uni.removeStorage({
				key: 'lifeData'
			})
		}
	},
	actions: {},
	modules: {
		bluetooth
	}
})
