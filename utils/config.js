let config = {
  ENV: 'development'
}
config.API_BASE_URL = (function () {
  switch (config.ENV) {
    case 'development': //开发环境
      return 'https://www.tudou.cn';

    case 'test': //测试环境
      return 'https://www.tudou.cn';

    case 'stage': //预发布环境
      return 'https://www.tudou.cn';

    case 'production': //真实环境
      return 'https://www.tudou.cn';

    default:
      throw Error('WEAPP_ENV只能取其中之一(development,test,stage,production)')
  }
})()

export default config
