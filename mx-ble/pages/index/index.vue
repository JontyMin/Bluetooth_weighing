<template name="components">
	<view>
		<scroll-view scroll-y class="page">
			<image src="/static/bgs.png" mode="widthFix" class="response"></image>
			<!-- <view style="position: fixed;font-size: 100rpx;top: 160rpx;width: 100%;text-align: center;color: #fff;">蓝牙模块</view> -->
			<view class="nav-list">
				<navigator hover-class='none' :url="'/pages/' + item.name + '/' + item.name" class="nav-li" navigateTo
					:class="'bg-'+item.color" :style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]"
					v-for="(item,index) in elements" :key="index">
					<view class="nav-title">{{item.title}}</view>
					<view class="nav-name">{{item.name}}</view>
					<text :class="'cuIcon-' + item.cuIcon"></text>
				</navigator>
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'
	export default {
		data() {
			return {
				version: '1.0.4',
				elements: [{
						title: '电子称',
						name: 'sxs',
						color: 'blue',
						cuIcon: 'shake'
					},
					{
						title: '设置',
						name: 'settings',
						color: 'red',
						cuIcon: 'settings'
					},
					{
						title: '出库扫描',
						name: 'scan',
						color: 'yellow',
						cuIcon: 'scan'
					},
					{
						title: '拣货',
						name: 'pick',
						color: 'pink',
						cuIcon: 'pick'
					},
					{
						title: '移库',
						name: 'move',
						color: 'orange',
						cuIcon: 'home'
					}
				],
			};
		},
		created() {

			/* console.log(this.$store.state.token)
			uni.getStorage({
				key: 'vuex_info',
				success: function(res) {
					console.log(res);
					console.log(res.data.success);
				},
			}) */
		},
		onShow() {
			uni.getSystemInfo({
				success: (res) => {
					//检测当前平台，如果是安卓则启动安卓更新  
					if (res.platform == "android") {
						console.log(res.platform);
						this.AndroidCheckUpdate();
					}
				}
			})
		},
		// 全局变量监控
		computed: mapState(['forcedLogin', 'vuex_hasLogin', 'vuex_token']),

		/* 	onLaunch:function(){
				let user = uni.getStorage('vuex_info')||'';
				console.log(user);
				console.log(user.data.success);
				if(user.data.success){
					uni.getStorage({
						key:'vuex_info',
						success:(res)=>{
							this.login(res.data);
						}
					})
				}
			} */
		onLoad() {
			console.log(this.vuex_token);
			console.log(this.vuex_hasLogin);
			if (!this.vuex_hasLogin) {
				uni.showModal({
					title: '未登录',
					content: '您未登录，请先登录',
					showCancel: !this.forcedLogin,
					success: (res) => {
						if (res.confirm) {
							if (this.forcedLogin) {
								uni.reLaunch({
									url: '../login/login'
								})
							} else {
								uni.navigateTo({
									url: '../login/login'
								})
							}
						}
					}
				})
			}
		},
		methods: {
			/**
			 * 安卓应用的检测更新实现
			 */
			
			
			AndroidCheckUpdate: function() {
				uni.request({
					url: 'https://api.lianzhoukuajing.com/api/Apk/' + this.version,
					method: 'GET',
					success: res => {
						console.log(res.data.result)
						if(res.data.result==true){
							//TODO 此处判断是否为 WIFI连接状态
							if (plus.networkinfo.getCurrentType() != 3) {
								uni.showToast({
									title: '有新的版本发布，检测到您目前非Wifi连接，为节约您的流量，程序已停止自动更新，将在您连接WIFI之后重新检测更新',
									mask: true,
									duration: 5000,
									icon: "none"
								});
								return;
							} else {
								uni.showModal({
									title: "版本更新",
									content: '有新的版本发布，检测到您当前为Wifi连接，是否立即进行新版本下载？',
									confirmText: '立即更新',
									cancelText: '稍后进行',
									success: function(res) {
										if (res.confirm) {
											uni.showToast({
												icon: "none",
												mask: true,
												title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',
												duration: 5000,
											});
											//设置 最新版本apk的下载链接
											var downloadApkUrl =
												'https://api.lianzhoukuajing.com/api/Apk/download/Depot.apk';
											var dtask = plus.downloader.createDownload(downloadApkUrl, {},
												function(d, status) {
													// 下载完成  
													if (status == 200) {
														plus.runtime.install(plus.io.convertLocalFileSystemURL(
															d.filename), {}, {}, function(error) {
															uni.showToast({
																title: '安装失败',
																duration: 1500
															});
														})
													} else {
														uni.showToast({
															title: '更新失败',
															duration: 1500
														});
													}
												});
											dtask.start();
										} else if (res.cancel) {
											console.log('稍后更新');
										}
									}
								});
							}
						}
					}
				});


				
			},


			/**
			 * 进行版本型号的比对 以及下载更新请求
			 * @param {Object} server_version 服务器最新 应用版本号
			 * @param {Object} curr_version 当前应用版本号
			 */
			checkVersionToLoadUpdate: function(server_version, curr_version) {
				console.log(server_version + '---' + curr_version);
				if (server_version > curr_version) {




					//TODO 此处判断是否为 WIFI连接状态
					if (plus.networkinfo.getCurrentType() != 3) {
						uni.showToast({
							title: '有新的版本发布，检测到您目前非Wifi连接，为节约您的流量，程序已停止自动更新，将在您连接WIFI之后重新检测更新',
							mask: true,
							duration: 5000,
							icon: "none"
						});
						return;
					} else {
						uni.showModal({
							title: "版本更新",
							content: '有新的版本发布，检测到您当前为Wifi连接，是否立即进行新版本下载？',
							confirmText: '立即更新',
							cancelText: '稍后进行',
							success: function(res) {
								if (res.confirm) {
									uni.showToast({
										icon: "none",
										mask: true,
										title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',
										duration: 5000,
									});
									//设置 最新版本apk的下载链接
									var downloadApkUrl = GLOBAL.DOMAIN_URL + "/apk/mzz2.apk";
									var dtask = plus.downloader.createDownload(downloadApkUrl, {},
										function(d, status) {
											// 下载完成  
											if (status == 200) {
												plus.runtime.install(plus.io.convertLocalFileSystemURL(
													d.filename), {}, {}, function(error) {
													uni.showToast({
														title: '安装失败',
														duration: 1500
													});
												})
											} else {
												uni.showToast({
													title: '更新失败',
													duration: 1500
												});
											}
										});
									dtask.start();
								} else if (res.cancel) {
									console.log('稍后更新');
								}
							}
						});
					}





				}
			},
		}
	}
</script>

<style>
	.page {
		height: 100vh;
	}
</style>
