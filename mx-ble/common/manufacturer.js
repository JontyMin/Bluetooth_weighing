// 此处存储厂商提供的服务Id
let data = [{
	id: 'sxs',
	name: 'FAYA', // 设备名称
	type: 'balance', // 设备类型
	manufacturer_name: '力匠', // 厂商
	serviceId: "0000FFE0-0000-1000-8000-00805F9B34FB", // 蓝牙特征值对应服务的 uuid
	characteristicId: "0000FFE1-0000-1000-8000-00805F9B34FB" // 蓝牙特征值的 uuid
}]
module.exports = {
	data: data
}
