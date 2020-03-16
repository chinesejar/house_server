# 心房小程序服务端

依赖：

- Koa.js
- mongoose
- joi

配置

`{NODE_ENV}.env` 文件为配置文件

参数：

- MONGO_URI `MongoDB`的 URI
- JWT_SECRET `jwt`密钥
- APP_ID 小程序 `app_id`
- APP_SECRET 小程序 `app_secret`
- CITY 城市名，爬虫需要用到

启动

```
# 后台启动
yarn start

# 启动爬虫 NODE_ENV 自定义，与配置文件同名
NODE_ENV=development yarn spider
```

util 目录
- spider.js 爬虫程序
  - getCity 获取全国所有省份和城市
  - getCommunities 获取 `CITY` 下的所有区、商圈、小区基本信息
  - getCommunityDetail 更新 `community` 数据库里还未更新详细信息的小区信息
