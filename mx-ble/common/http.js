import host from "./config.js"
module.exports = (params) => {
	/*默认值*/
		params.showLoading = params.showLoading == undefined ? true : params.showLoading;
		params.method = params.method == undefined ? "GET" : params.method;
		params.api = params.api == undefined ? "" : params.api;
		params.header = params.header == undefined ? {
			'X-Requested-With': 'XMLHttpRequest',
			"Authorization": 'Bearer ' + this.$store.state.token
		} : params.header;
		if (params.contentType){
			params.header['content-type'] = params.contentType
		}
		/**/
		if (params.showLoading) {
			uni.showLoading({
				mask: true,
				title: (params.showLoadingTitle ? params.showLoadingTitle : "加载中...")
			});
		}
		let url = host + params.url;
		
		uni.request({
			url: url,
			data: params.data,
			header: params.header,
			method: params.method,
			success: (res) => {
				if	(res.statusCode && res.statusCode != 200){
								//	api错误
								uni.showModal({
									content:res.msg
								})
								return;
							}
							typeof params.success == "function" && params.success(res.data);
			},
			complete: () => {
				if (params.showLoading) {
					uni.hideLoading();
				}
				typeof params.complete == "function" && params.complete(e.data);
				return;
			},
			fail: err => {
				uni.showModal({
					content: err.msg
				})
				typeof params.fail == "function" && params.fail(err.data);
			}
		});
	}
