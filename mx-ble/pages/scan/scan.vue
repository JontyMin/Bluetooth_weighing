<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">出库扫描</block>
			<block slot="right">
				<button @tap="openSetting" class="cu-btn text-white cuIcon-settingsfill margin-right"
					style="font-size: 35rpx;background-color: transparent;" />
			</block>
		</cu-custom>
		<view class="bg-gray text-black padding">
			<view class="cu-list menu r">
				<view class="cu-form-group">
					<view class="title">跟踪号</view>
					<input placeholder="点击扫描跟踪号" v-model="code" :focus="isFocus" name="input"
						@confirm="getOrder()"></input>
					<!-- <text class="cuIcon-delete"></text> -->
					<text class='cuIcon-scan' @click="scan(scanObj)"></text>
				</view>
				<view class="cu-form-group">
					<view class="title">重量</view>
					<input placeholder="蓝牙获取重量" disabled :value="weight" name="input"></input>
					<text>KG</text>
				</view>
				<view class="cu-form-group">
					<view class="title">平台</view>
					<picker @change="PickerChange" :value="index" :range="picker">
						<view class="picker">
							{{index>-1?picker[index]:'选择平台'}}
						</view>
					</picker>
				</view>
			</view>
		</view>
		<view class="bg-gray text-black padding" v-show="isShow">
			<view class="solids-bottom flex bg-white r">
				<view class="flex-sub">
					<view style="padding: 30rpx 30rpx 15rpx 30rpx;">
						<text class="text-black text-xl">订单号:{{purchaseOrder.orderId}}</text>
						<view class="cu-tag bg-blue light" style="float: right;width: 160rpx;">
							{{purchaseOrder.isDeliveryScan}}
						</view>
					</view>
					<view style="padding-left: 30rpx;">
						<text class="flex-sub ">平台：{{purchaseOrder.platformName}}</text>
					</view>
					<view style="padding-left: 30rpx;">
						<text class="flex-sub ">跟踪号：{{purchaseOrder.trackingNo}}</text>
					</view>
					<view style="padding-left: 30rpx;">
						<text class="flex-sub ">数量：{{purchaseOrder.num}}</text>
					</view>
					<view style="padding-left: 30rpx;">
						<text class="flex-sub ">重量(kg)：{{purchaseOrder.scanWeight}}</text>
					</view>
					<view style="padding-left: 30rpx;">
						<text class="flex-sub ">订单下单时间：{{purchaseOrder.orderTime}}</text>
					</view>
					<view style="padding-left: 30rpx; margin-bottom: 20rpx;">
						<text class="flex-sub ">打印时间：{{purchaseOrder.printTime}}</text>
					</view>
					<view class="solid-top" style="margin-top: 30rpx;">
						<text class="flex-sub text-black"
							style="margin: 20rpx; float: right;line-height: 70rpx;">【{{purchaseOrder.deliveryScanName}}】扫描于{{purchaseOrder.deliveryScanTime}}</text>
					</view>
				</view>
			</view>
		</view>
		<drawer-settings :show="show" @show="openSetting" />
	</view>
</template>

<script>
	import Bluetooth from '@/common/bluetooth.js';
	import {
		mapState
	} from 'vuex'
	let _self, blews = new Bluetooth();
	var ScanModule = uni.requireNativePlugin("wss-scan");
	const innerAudioContext = uni.createInnerAudioContext();

	export default {
		data() {
			return {
				isFocus: true,
				isShow: false,
				isCard: true,
				index: -1,
				picker: ['Shopee', 'Mercado', 'Amazon', 'Jumia', 'Daraz', 'Linio', 'Lazada', 'B2W', 'Cdiscount'],
				show: false,
				paired: [],
				platform: '',
				weight: '',
				code: '',
				isScan: '',
				TrackCode: '',
				purchaseOrder: {
					"platformName": "",
					"num": "",
					"trackingNo": "",
					"isDeliveryScan": "",
					"deliveryScanName": "",
					"scanWeight": "",
					"deliveryScanTime": "",
					"orderId": "",
					"printTime": "",
					"orderTime": ""
				},
				scanObj: {
					"scanType": [],
					"scanKey": "wss2",
				},
			}
		},
		onLoad() {
			_self = this;
			// this.isFocus=true;
		},
		watch: {
			weight(e) {
				if (e != '') {
					this.bindConfirm()
				}
			},
			'$store.state.bluetooth.paired': {
				handler(e) {
					this.paired = e;
					if (e[0] && e[0].status) {
						this.notifyBLECharacteristicValueChange(e[0]);
					} else if (e[0] && !e[0].status) {
						setTimeout(res => {
							this.weight = 0;
						}, 500);
					}
				},
				immediate: true,
				deep: true
			},
			platform() {
				if (this.code != '') {
					this.getOrder();
				}
			},
			code(e) {
				// this.isShow=false;
				if (e != '' && e.length > 6) {
					this.getOrder();
				}
			}
		},
		computed: mapState(['forcedLogin', 'vuex_hasLogin', 'vuex_token']),
		methods: {

			PickerChange(e) {
				this.index = e.detail.value
				this.platform = this.picker[e.detail.value]
				console.log(this.picker[e.detail.value]);
			},
			IsCard(e) {
				this.isCard = e.detail.value
			},
			// 设置
			openSetting() {
				this.show = !this.show;
			},
			// 检测重量
			async notifyBLECharacteristicValueChange(item) {
				let self = this;
				try {
					// 检测服务
					await blews.getBLEDeviceServices(item.deviceId, item.serviceId);
					await blews.getBLEDeviceCharacteristics(item.deviceId, item.serviceId, item.characteristicId);
					// 启用notify，必须先启用notify才能调用onBLECharacteristicValueChange
					await blews.notifyBLECharacteristicValueChange(item.deviceId, item.serviceId, item
						.characteristicId);
					uni.onBLECharacteristicValueChange(function(res) {
						self.weight = blews.ab2Weight(res.value);
					});
				} catch (err) {
					uni.showToast({
						title: e.errMsg,
						icon: 'none',
						position: 'bottom'
					});
				}
			},
			// 调起条码扫描
			scan(v) {
				// 调起条码扫描
				// uni.scanCode({
				// 	scanType: ['barCode', 'qrCode', 'datamatrix', 'pdf417'],
				// 	success: function(res) {
				// 		console.log('条码类型：' + res.scanType);
				// 		console.log('条码内容：' + res.result);
				// 		_self.code = res.result;
				// 		_self.isFocus=false;
				// 	}
				// });

				// uni.vibrateShort({
				// 	success: function() {
				// 		// console.log('test ');
				// 	}
				// });

				ScanModule.scan(v,
					(result) => {
						var ret = result.scanValue;
						console.log(ret.sValue);
						_self.code = ret.sValue;
						_self.isFocus = false;
					})
			},
			// 获取订单信息
			getOrder() {
				// console.log('Bearer ' + this.vuex_token)

				let url = 'https://api.lianzhoukuajing.com/api/Depot/' + this.code;
				if (this.platform !== '') {
					url += '/' + this.platform;
				}
				uni.request({
					url: url,
					method: "GET",
					header: {
						"Authorization": 'Bearer ' + this.vuex_token
					},
					success: res => {
						console.log(res.data);

						if (res.data.success) {
							this.isShow = true;
							this.purchaseOrder = res.data.response;
							uni.hideKeyboard();
						} else {
							this.isShow = false;
							this.code = '';
							this.isFocus = true;
						}

						
						uni.showToast({
							title: res.data.msg,
							icon: "none",
							duration: 2000
						});
						innerAudioContext.autoplay = true;
						innerAudioContext.src = '../../static/mp3/' + res.data.file + '.mp3';
						innerAudioContext.onPlay();

						if (res.data.code == 401) {
							uni.showToast({
								title: '登录状态过期',
								icon: 'none',
								duration: 2000
							});
							uni.removeStorage({
								key: 'lifeData'
							})
							uni.reLaunch({
								url: '../login/login'
							})
						}
					}
				})
			},
			bindConfirm() {
				if (this.weight != '') {
					if (this.purchaseOrder.trackingNo != '') {
						uni.request({
							url: 'https://api.lianzhoukuajing.com/api/Depot/',
							method: "POST",
							header: {
								"Authorization": 'Bearer ' + this.vuex_token
							},
							data: {
								"trackNo": this.purchaseOrder.trackingNo,
								"weight": this.weight
							},
							success: res => {
								console.log(res.data);

								this.code = '';
								this.weight = '';
								this.isFocus = true;

								if (res.data.success) {
									this.purchaseOrder = res.data.response;
								}
								innerAudioContext.autoplay = true;
								innerAudioContext.src = '../../static/mp3/' + res.data.file + '.mp3';
								innerAudioContext.onPlay();


								uni.showToast({
									title: res.data.msg,
									icon: "success",
									duration: 2000
								});
								this.isFocus = true;

								if (res.data.code == 401) {
									uni.showToast({
										title: '登录状态过期',
										icon: "success",
										duration: 2000
									});
									uni.removeStorage({
										key: 'lifeData'
									})
									uni.reLaunch({
										url: '../login/login'
									})
								}
							}
						})

					}
				}
			},
		},
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
