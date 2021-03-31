let host="";
if(process.env.NODE_ENV === 'development'){
	host = "https://api.lianzhoukuajing.com/api/";
}else{
	host = "https://api.lianzhoukuajing.com/api/";
}

export default host;