const { AuthController } = require("./controller/AuthController");
const { CityController } = require("./controller/CityController");
const { UserController } = require("./controller/UserController");

const Routes = [{
    method: "post",
    route: "/auth/login",
    controller: AuthController,
    action: "login"
}, {
    method: "post",
    route: "/auth/wechat",
    controller: AuthController,
    action: "wechatAuth"
}, {
    method: "get",
    route: "/city",
    controller: CityController,
    action: "all"
}, {
    method: "get",
    route: "/city/:id",
    controller: CityController,
    action: "one"
}, {
    method: "put",
    route: "/user",
    controller: UserController,
    action: "put"
}];

module.exports = Routes;