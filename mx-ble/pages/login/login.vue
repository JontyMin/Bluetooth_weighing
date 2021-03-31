<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" isBack="false">
			<block slot="content">登录</block>
		</cu-custom>
		<view class="bg-gray text-black padding-xl">
			<view class="cu-list menu r">
				<form>
					<view class="cu-form-group">
						<view class="title">用户名</view>
						<input placeholder="请输入用户名" focus v-model="model.user"></input>
					</view>
					<view class="cu-form-group">
						<view class="title">密码</view>
						<input placeholder="请输入密码" v-model="model.password" password="true"></input>
					</view>
				</form>
			</view>
			<view class="padding flex flex-direction">
				<button class="cu-btn bg-blue margin-tb-sm lg" @click="submit">登录</button>
			</view>
		</view>

	
	</view>
</template>

<script>
	import {mapState,mapMutations} from 'vuex'
	export default {
		data() {
			return {
				model: {
					/* 账号 */
					user: '',
					/* 密码 */
					password: ''
				},
			}
		},
		created() {
			this.model.user.focus=true;
		},
		// 全局变量监控
		computed:mapState(['forcedLogin','vuex_hasLogin','vuex_token']),
		methods: {
			submit() {
				uni.showLoading({
					title: '登录中......',
					mask: true
				});
				uni.request({ 
					url: 'https://api.lianzhoukuajing.com/api/Account/ErpToken',
					method: 'POST',
					data: {
						userName: this.model.user,
						passWord: this.model.password,
					},
					success: res => {
						uni.hideLoading();

						console.log(res.data.success);
						if (res.data.success) {
							//this.$store.state.vuex_user('vuex_user.hasLogin', true)
							// this.login("vuex_hasLogin",true);
							this.login(res.data.token);
							uni.showToast({
								title:'登录成功',
								icon:"success",
								duration: 2000
							});

							uni.redirectTo({
								url: '../index/index'
							});
						} else {
							uni.showToast({
								title: '登录失败',
								icon:"success",
								duration: 2000
							});
						}
					}
				});
			},
			...mapMutations(['login','logout']),
		}
	}
</script>

<style>
	.cu-form-group .title {
		min-width: calc(4em + 15px);
	}

	.r {
		border-radius: 30rpx;
	}


	
</style>
