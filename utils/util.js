import config from './config';
import api from  './api'
let util = {
  api:api,
  showToast:function (params) { //提示框
    wx.showToast({
      title: params.title,
      icon: params.icon || 'none',
      image:params.image || '',
      duration: params.duration || 2000,
      mask:params.mask || true
    })
  },
  token(_session){ //获取或者更新token
    let sessionData;
    try {
      if (_session) {
        sessionData = _session;
        wx.setStorageSync('__SESSION__', sessionData);
      } else {
        sessionData = wx.getStorageSync('__SESSION__');
      }
    } catch (e) {
      console.log(e);
    }
    return Object.assign({
      token: ''
    }, sessionData);
  },
  getDataSet:function(event, key) { /*获得元素上的绑定的值*/
    return event.currentTarget.dataset[key];
  },
  throttle:function (fn,gapTime) {  /*函数节流，避免重复执行*/
    if (gapTime == null || gapTime == undefined) {
      gapTime = 1500
    }
    let _lastTime = null
    // 返回新的函数
    return function () {
      let _nowTime = + new Date()
      if (_nowTime - _lastTime > gapTime || !_lastTime) {
        fn.apply(this, arguments)   //将this和参数传给原函数
        _lastTime = _nowTime
      }
    }
  },
  fetchApi:function (params,noRefetch) {
    let method = params.method || 'POST';
    let promise = new Promise(function (resolve, reject) {
      wx.request({
        url:config.API_BASE_URL+params.url,
        data:params.data || {},
        method:method,
        header: {
          'content-type': 'application/json', // 默认值
          'token':util.token().token
        },
        success (res) {
          var res = res.data;
          if(res.code == 0){
            resolve(res.data)
          }else if(res.code == 1){ //异常
            var noAbnormalTips = !params.noAbnormalTips;
            if(noAbnormalTips){
              util.showToast({
                title:res.errmsg
              })
            }
            reject(res.errmsg)
          }else if(res.code == 2){//未登录
            if(!noRefetch){
              util.login().then((function (res) {
                return util.fetchApi(params,true)
              })).then(function (res) {
                reject(res)
              }).catch(function (error) {
                console.log(error)
              });
            }
          }else if(res.code == 3){//未注册

          }
        },
        fail(error){
          util.showToast({
            title:error.errMsg
          })
        }
      })

    });
    return promise;
  },
  login:function () {  //登录
    return new Promise((resolve,reject) => {
      wx.login({
        success (res) {
          if (res.code) {
            resolve(res.code)
          }else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }).then((code) => {
      return util.fetchApi({
        url:util.api.LOGIN,
        data:{
          code:code
        }
      })
    }).then((res) => {
      util.token(res)
      return res
    })
  },
  add:function (a,b) { //两个浮点数相加
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (util.mul(a, e) + util.mul(b, e)) / e;
  },
  sub:function (a,b) { //两个浮点数相减
    var c, d, e;
    try {
      c = a.toString().split(".")[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split(".")[1].length;
    } catch (f) {
      d = 0;
    }
    return e = Math.pow(10, Math.max(c, d)), (util.mul(a, e) - util.mul(b, e)) / e;
  },
  mul:function (a, b) { //两个浮点数相乘
    var c = 0,
      d = a.toString(),
      e = b.toString();
    try {
      c += d.split(".")[1].length;
    } catch (f) {}
    try {
      c += e.split(".")[1].length;
    } catch (f) {}
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
  },
  div:function (a, b) { //两个浮点数相除
    var c, d, e = 0,
      f = 0;
    try {
      e = a.toString().split(".")[1].length;
    } catch (g) {}
    try {
      f = b.toString().split(".")[1].length;
    } catch (g) {}
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), util.mul(c / d, Math.pow(10, f - e));
  },
  filterFloat:function (floatNum) { //浮点数去浮点 1.00 转成 1
    var intNum = util.mul(floatNum,100)
    var result = util.div(intNum,100)
    return parseFloat(result);
  },
  unique:function(arr){ //数组去重
    return Array.from(new Set(arr))
  }
}
export default util;