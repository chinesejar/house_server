const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const mongoose = require('mongoose');
const jwt = require('koa-jwt');
const dotenv = require('dotenv');
const Routes = require('./Router');

const app = new Koa();
const router = new Router();

dotenv.config({
  path: `./${app.env}.env`
})

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true
}, (err) => {
  if (!err) console.log('MongoDB 连接成功')
  else console.log('MongoDB 连接失败')
});

app.use(bodyParser());
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(jwt({ secret: process.env.JWT_SECRET }).unless({
  // the routes as follow without jwt auth
  // path: [/\/auth/]
  path: [/\//]
}));
app.use(router.routes()).use(router.allowedMethods());

Routes.forEach(route => {
  router[route.method](route.route, async (ctx) => {
    ctx.body = await (new (route.controller))[route.action](ctx);
  });
});

app.listen(3000);
