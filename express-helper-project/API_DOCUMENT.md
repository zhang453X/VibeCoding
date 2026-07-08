# 校园快递代取助手 - 完整接口文档 v1.0

> **后端框架**：Spring Boot 3.4.5  
> **接口风格**：RESTful + JSON  
> **统一前缀**：`/api`  
> **服务端口**：8080（默认）  
> **鉴权方式**：JWT Bearer Token（`Authorization: Bearer <token>`）  
> **CORS**：全局开启，允许所有来源+方法+请求头，`allowCredentials=true`  
> **Swagger**：[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) （springdoc-openapi）  

---

## 目录

1. [统一规范](#1-统一规范)
   - 1.1 基础 URL
   - 1.2 统一响应结构（ApiResponse）
   - 1.3 错误响应 & 错误码
   - 1.4 JWT 鉴权机制
   - 1.5 白名单接口（免鉴权）
   - 1.6 分页结构说明
2. [接口总览（按权限分级）](#2-接口总览按权限分级)
3. [🔓 公共接口（免鉴权）](#3-公共接口免鉴权)
4. [👤 用户 & 认证模块](#4-用户--认证模块)
   - 4.1 用户注册
   - 4.2 登录（用户/管理员共用）
5. [📦 订单模块（OrderController）](#5-订单模块ordercontroller)
6. [⭐ 评价模块（ReviewController）](#6-评价模块reviewcontroller)
7. [📝 实名认证模块（AuthController 除登录外）](#7-实名认证模块authcontroller-除登录外)
8. [💳 用户中心模块（UserController 除注册外）](#8-用户中心模块usercontroller-除注册外)
9. [📢 申诉/投诉模块（AppealController）](#9-申诉投诉模块appealcontroller)
10. [💬 帮助与反馈模块（FeedbackController）](#10-帮助与反馈模块feedbackcontroller)
11. [📤 文件上传模块（UploadController）](#11-文件上传模块uploadcontroller)
12. [🌐 公共数据模块（PublicController）](#12-公共数据模块publiccontroller)
13. [🔧 管理员模块（AdminController）](#13-管理员模块admincontroller)
14. [🧪 测试接口（TestController，仅开发环境）](#14-测试接口testcontroller仅开发环境)
15. [附录 A：枚举值速查](#附录-a枚举值速查)
16. [附录 B：常见错误 message 对照表](#附录-b常见错误-message-对照表)
17. [附录 C：前端对接注意事项](#附录-c前端对接注意事项)

---

## 1. 统一规范

### 1.1 基础 URL

```
本地: http://localhost:8080/api
部署: 按实际域名
```

所有 Content-Type 除非特别说明（如文件上传为 `multipart/form-data`，导出为二进制流），均为 `application/json;charset=UTF-8`。

### 1.2 统一响应结构（ApiResponse）

来源源码：[ApiResponse.java](backend/src/main/java/com/campus/expresshelper/common/ApiResponse.java)

```json
{
  "code": 0,
  "message": "ok",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | int | **0 = 成功**；**-1 = 失败**（业务失败/参数校验失败/系统异常均为 -1，通过 message 区分） |
| `message` | string | 结果描述。成功时通常为"ok"/具体操作说明；失败时为可读错误文案 |
| `data` | T/Object | 返回数据。无数据时为 `null`。 |

### 1.3 错误响应 & 错误码

所有失败响应**统一 `code = -1`**，具体失败类型由 `message` 区分（[GlobalExceptionHandler.java](backend/src/main/java/com/campus/expresshelper/common/GlobalExceptionHandler.java) 处理 3 类异常）：

| 异常类 | 触发场景 | 响应示例 |
|--------|---------|---------|
| `BusinessException` | 业务逻辑校验失败（登录失败/无权限/状态不合法等） | `{"code":-1,"message":"用户名或密码错误","data":null}` |
| `MethodArgumentNotValidException` | `@Valid` 参数校验失败（@NotBlank/@Min等） | `{"code":-1,"message":"不能为空","data":null}`（取第一个字段错误） |
| `Exception` | 运行时未捕获异常 | `{"code":-1,"message":"系统异常: NullPointerException","data":null}` |

### 1.4 JWT 鉴权机制

1. **Token 获取**：调用 [POST /api/auth/login](#42-登录接口) 成功后，从 `data.token` 读取。
2. **Token 携带方式**：所有非白名单接口请求 Header 必须包含：
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJVU0VSIn0.xxx
   ```
3. **Token 内容（Claims）**：
   - `userId`：用户ID（管理员固定为 `0`）
   - `role`：`USER` 或 `ADMIN`（缺省按 USER 处理）
4. **Token 有效期**：24 小时（`jwt.expire-hours=24`，[application.yml](backend/src/main/resources/application.yml#L31-L34)）
5. **小程序端 Token 过期处理**：[app.js handleRequestError](miniprogram/app.js#L53-L61) 识别 `"JWT expired"` / `"未登录或登录已过期"` 后自动跳转登录。

### 1.5 白名单接口（免鉴权）

来源：[WebMvcConfig.java](backend/src/main/java/com/campus/expresshelper/config/WebMvcConfig.java#L19-L27)

| # | URL 模式 | 说明 |
|---|---------|------|
| 1 | `/api/auth/login` | 登录（用户+管理员） |
| 2 | `/api/user/register` | 学生注册 |
| 3 | `/api/public/**` | 公共数据：快递点列表/详情 |
| 4 | `/v3/api-docs/**`、`/swagger-ui/**`、`/swagger-ui.html` | Swagger/OpenAPI |
| 5 | `/uploads/**` | 静态上传图片（如头像、实名认证图） |

此外 **OPTIONS 预检请求**（`JwtInterceptor.preHandle`）直接放行。

### 1.6 分页结构说明

所有分页列表（管理员接口为主）返回格式**统一**为：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "records": [ ...单条数组... ],
    "total": 138,
    "page": 1,
    "size": 20,
    "pages": 7
  }
}
```

---

## 2. 接口总览（按权限分级）

| 权限级别 | 接口数 | 模块 | 鉴权要求 |
|---------|-------|------|---------|
| 🔓 白名单（免鉴权） | 5 | 登录、注册、公共快递点(2)、静态文件 | - |
| 👤 普通用户（USER） | 25 | 用户中心、订单(大厅/发布/详情/抢单/取消/重发/我的…)、实名认证、评价、申诉、反馈、上传、AI客服 | JWT(USER) + `assertSelfOrAdmin(userId)` 校验**只能操作自己数据** |
| 🔧 管理员（ADMIN） | 26 | /api/admin/** 全部：用户(冻结/修改/重置密码/切换代取)、认证(审核)、订单(列表/强制取消/仪表盘/导出)、申诉(处理)、反馈(处理)、系统配置(增删查)、快递点(增删改查) | JWT 必须 `role=ADMIN` + `assertAdmin()` |
| 🧪 测试 | 2 | /api/test/**（建议生产删除/加IP白名单） | 仍需 JWT |
| **合计** | **58** | — | — |

三级权限校验实现：
- 路由级：[JwtInterceptor](backend/src/main/java/com/campus/expresshelper/security/JwtInterceptor.java)
- 数据级：[SecurityUtil.assertSelfOrAdmin()](backend/src/main/java/com/campus/expresshelper/security/SecurityUtil.java#L14-L18)
- 角色级：[SecurityUtil.assertAdmin()](backend/src/main/java/com/campus/expresshelper/security/SecurityUtil.java#L20-L24)

---

## 3. 🔓 公共接口（免鉴权）

### 3.1 公共快递点列表（启用的）
> 供小程序首页、发布订单页面下拉数据源使用。

| 项 | 值 |
|---|---|
| URL | `GET /api/public/express-stations` |
| 权限 | 免鉴权 |
| 对应源码 | [PublicController.listStations()](backend/src/main/java/com/campus/expresshelper/controller/PublicController.java#L17-L20) |
| 服务方法 | `ExpressStationService.listPublicStations()`（返回 `enabled=1`，按 sort_order 升序） |

**请求参数**：无

**成功响应示例**：
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "station_name": "菜鸟驿站(东区)",
      "campus_area": "东区",
      "detail_address": "东区食堂南侧100米",
      "longitude": 116.397000",
      "latitude": 39.908000,
      "amap_poi_id": null,
      "contact_name": "李师傅",
      "contact_phone": "138****0001",
      "service_time": "08:00-20:00",
      "sort_order": 1,
      "enabled": 1,
      "description": "支持中通/圆通/韵达"
    }
  ]
}
```

---

### 3.2 公共快递点详情
| 项 | 值 |
|---|---|
| URL | `GET /api/public/express-stations/{id}` |
| 权限 | 免鉴权 |
| 对应源码 | [PublicController.stationDetail()](backend/src/main/java/com/campus/expresshelper/controller/PublicController.java#L22-L25) |

**路径参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | Long | ✅ | 快递点 ID |

---

## 4. 👤 用户 & 认证模块

### 4.1 用户注册（学生）
| 项 | 值 |
|---|---|
| URL | `POST /api/user/register` |
| 权限 | 免鉴权（白名单） |
| 对应源码 | [UserController.register()](backend/src/main/java/com/campus/expresshelper/controller/UserController.java#L25-L28) |
| 服务方法 | [UserService.register()](backend/src/main/java/com/campus/expresshelper/service/UserService.java#L26-L59) |

**请求 Body（`@Valid` 校验）**：

| 字段 | 类型 | 必填 | 规则 | 说明 |
|------|------|------|------|------|
| `studentNo` | string | ✅ | 正则 `^[0-9A-Za-z]{6,20}$`，全局唯一 | 学号 |
| `username` | string | ❌ | 正则 `^[0-9A-Za-z_]{4,20}$`，全局唯一 | 用户名。留空时默认=studentNo |
| `nickname` | string | ✅ | 长度 2-20 | 昵称 |
| `phone` | string | ✅ | 正则 `^1[3-9]\d{9}$`，全局唯一 | 手机号 |
| `password` | string | ✅ | 长度 6-20 | 密码（明文存储） |

**请求示例**：
```json
{
  "studentNo": "2023001001",
  "username": "zhangsan",
  "nickname": "张三",
  "phone": "13800138000",
  "password": "123456"
}
```

**成功响应**（password 置 null，phone 脱敏返回）：
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": 1,
    "studentNo": "2023001001",
    "username": "zhangsan",
    "nickname": "张三",
    "phone": "138****8000",
    "password": null,
    "authStatus": 0,
    "courierEnabled": 0,
    "creditScore": 60,
    "greenScore": 0,
    "freezeStatus": 0,
    ...
  }
}
```

**可能失败 message**：`请输入学号`、`学号格式不正确，请输入 6-20 位字母或数字`、`学号已注册`、`用户名已存在`、`手机号已注册`、`手机号格式不正确`、`密码长度需为 6-20 位`

---

### 4.2 登录接口（用户/管理员共用）
| 项 | 值 |
|---|---|
| URL | `POST /api/auth/login` |
| 权限 | 免鉴权（白名单） |
| 对应源码 | [AuthController.login()](backend/src/main/java/com/campus/expresshelper/controller/AuthController.java#L18-L21) |
| 服务方法 | [AuthService.login()](backend/src/main/java/com/campus/expresshelper/service/AuthService.java#L121-L145) |

**请求 Body（LoginRequest，`@NotBlank` 三字段均必填）**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | ✅ | 管理员=固定 `admin`；用户=用户名 或 学号 |
| `password` | string | ✅ | 管理员=固定 `admin123`；用户=注册时明文密码 |
| `role` | string | ✅ | **`ADMIN`**（不区分大小写）= 管理员；其他值=普通用户 |

**请求示例 1：学生登录**
```json
{ "username": "2023001001", "password": "123456", "role": "USER" }
```

**请求示例 2：管理员登录**
```json
{ "username": "admin", "password": "admin123", "role": "ADMIN" }
```

**成功响应 - 普通用户**：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiVVNFUiIsInVzZXJJZCI6MX0.xxx",
    "role": "USER",
    "userId": 1,
    "nickname": "张三"
  }
}
```

**成功响应 - 管理员**：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJ1c2VySWQiOjB9.xxx",
    "role": "ADMIN",
    "userId": 0
  }
}
```

**可能失败 message**：`不能为空`(任一字段为空)、`管理员账号或密码错误`、`用户名或密码错误`、`账号已冻结`

---

## 5. 📦 订单模块（OrderController）
> 所有涉及 `userId` / `publisherId` / `courierId` / `operatorId` 的接口均通过 `SecurityUtil.assertSelfOrAdmin(...)` 校验，确保普通用户只能操作自己的订单；管理员可操作全部。

### 5.1 发布订单
| 项 | 值 |
|---|---|
| URL | `POST /api/order` |
| 权限 | 👤 USER/ADMIN（需为发单人本人或管理员） |
| 对应源码 | [OrderController.create()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L20-L24) |
| 服务方法 | [OrderService.createOrder()](backend/src/main/java/com/campus/expresshelper/service/OrderService.java#L48-L71) |

**请求 Body（OrderCreateRequest）**：

| 字段 | 类型 | 必填 | 校验 | 说明 |
|------|------|------|------|------|
| `publisherId` | Long | ✅ | 非空 + SelfOrAdmin | 发单人用户ID |
| `expressCompany` | string | ✅ | @NotBlank | 快递公司，例："顺丰" |
| `expressNo` | string | ✅ | @NotBlank | 快递单号（对外脱敏显示） |
| `pickupCode` | string | ✅ | @NotBlank | 取件码（真实值，系统自动生成 pickupCodeMasked） |
| `stationName` | string | ✅ | @NotBlank | 快递点名称，对应 `express_station_info.station_name` |
| `expressType` | string | ✅ | @NotBlank | 快递类型，如"小型/中型/大型" |
| `pickupTimeRange` | string | ✅ | @NotBlank | 取件时间范围，如"10:00-12:00" |
| `deliveryLocation` | string | ✅ | @NotBlank | 送达地点，如"东区12号楼" |
| `remark` | string | ❌ | — | 备注 |
| `fee` | BigDecimal | ✅ | ≥0.1 | 代取费（元） |
| `allowBargain` | Integer | ✅ | 非空 | **0**=一口价；**1**=允许议价 |
| `validMinutes` | Integer | ✅ | 非空 | 有效时长(分钟)，决定 expire_at = now + validMinutes |
| `contactPhone` | string | ❌ | — | 订单联系电话，优先用这个，脱敏返回 |

**成功响应 data = Long（新订单 ID）**：
```json
{ "code": 0, "message": "订单发布成功", "data": 101 }
```

---

### 5.2 抢单大厅（订单列表，可选筛选）
| 项 | 值 |
|---|---|
| URL | `GET /api/order/hall` |
| 权限 | 👤 USER/ADMIN（所有登录用户均可查看） |
| 对应源码 | [OrderController.hall()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L31-L35) |
| 返回数据说明 | 敏感字段（expressNo/pickupCode/contactPhone）**自动脱敏**，仅订单当事方和管理员查看详情时才能看到明文 |

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationName` | string | ❌ | 按快递点名称筛选 |
| `expressType` | string | ❌ | 按快递类型筛选 |

**仅返回 status = `PENDING_GRAB`（待抢单）的订单，按 created_at 倒序。**

---

### 5.3 订单详情
| 项 | 值 |
|---|---|
| URL | `GET /api/order/{id}` |
| 权限 | 👤 USER/ADMIN |
| 对应源码 | [OrderController.getOrderDetail()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L26-L29) |
| 敏感字段规则 | **发单人 / 代取员 / 管理员** → 返回明文；**其他人** → 返回脱敏版本（见 OrderService.maskSensitiveFields） |

**路径参数**：`id` = 订单ID

---

### 5.4 抢单
| 项 | 值 |
|---|---|
| URL | `POST /api/order/{id}/grab` |
| 权限 | 👤 USER/ADMIN（必须是代取员本人且已开通代取权限） |
| 对应源码 | [OrderController.grab()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L37-L42) |
| 并发控制 | Redis 分布式锁 KEY=`order:grab:lock:{id}`（10秒过期） + MySQL 乐观锁 `WHERE version=?` |
| 服务方法 | [OrderService.grabOrder()](backend/src/main/java/com/campus/expresshelper/service/OrderService.java#L99-L136) |

**路径参数**：`id` = 订单ID

**请求 Body（GrabOrderRequest）**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `courierId` | Long | ✅ | 代取员用户ID（SelfOrAdmin 校验） |

**可能失败 message**：`代取员未认证或被禁用`、`手慢了，订单已经被抢走了`、`抢单失败，订单不可用`、`订单不存在`

---

### 5.5 更新订单状态（取件/配送/完成）
| 项 | 值 |
|---|---|
| URL | `POST /api/order/{id}/status` |
| 权限 | 👤 USER/ADMIN |
| 对应源码 | [OrderController.status()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L44-L51) |
| 状态流转合法性**强制校验** | 见 `OrderService.isValidStatusTransition()`；**非法流转直接报错** |
| 操作权限校验 | 发单人只能将状态推进为 `PICKED_UP` / `COMPLETED`；代取员可执行所有合法流转 |

**Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `operatorId` | Long | ✅ | 操作人ID（SelfOrAdmin） |
| `status` | OrderStatus enum | ✅ | 目标状态（字符串枚举，见附录A） |

**状态流转合法路径**：
```
PENDING_GRAB ──→ GRABBED ──→ PICKED_UP ──→ DELIVERING ──→ COMPLETED
                           ↘→ DELIVERING ↗       ↘→ COMPLETED
```

---

### 5.6 发单人主动取消订单
| 项 | 值 |
|---|---|
| URL | `POST /api/order/{id}/cancel` |
| 权限 | 👤 USER/ADMIN（仅发单人本人） |
| 对应源码 | [OrderController.cancel()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L53-L58) |
| 限制条件 | **仅 status = PENDING_GRAB（未抢单）** 的订单才能取消；其他状态一律报错 |
| 写入字段 | `status=CANCELLED`，`cancel_reason="用户主动取消"`，`cancel_type=USER_CANCEL`；同时从 Redis 超时 ZSet 移除 |

**Query 参数**：`publisherId` 发单人ID（SelfOrAdmin 校验）

---

### 5.7 我发布的订单列表
| 项 | 值 |
|---|---|
| URL | `GET /api/order/published/{userId}` |
| 权限 | 👤 USER/ADMIN（只能看自己的） |
| 对应源码 | [OrderController.published()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L60-L64) |
| 排序 | created_at 倒序，不过滤状态（所有状态都返回） |

---

### 5.8 我抢到的订单列表
| 项 | 值 |
|---|---|
| URL | `GET /api/order/grabbed/{userId}` |
| 权限 | 👤 USER/ADMIN |
| 对应源码 | [OrderController.grabbed()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L66-L70) |

---

### 5.9 重新发布已取消的订单
| 项 | 值 |
|---|---|
| URL | `POST /api/order/{id}/republish` |
| 权限 | 👤 USER/ADMIN（发单人本人） |
| 对应源码 | [OrderController.republish()](backend/src/main/java/com/campus/expresshelper/controller/OrderController.java#L72-L76) |
| 限制条件 | ①原订单 status 必须 = CANCELLED（兼容 CANCELED 拼写错）②`republished != 1` 只能重发一次 |
| 行为 | **创建一条全新的 order_info 记录**（copy 字段），status=PENDING_GRAB，默认有效期=60分钟；原订单 republished=1 打标 |

**Query 参数**：`publisherId` 发单人ID  
**成功响应 data = Long（新订单ID）**

---

## 6. ⭐ 评价模块（ReviewController）

### 6.1 提交订单评价
| 项 | 值 |
|---|---|
| URL | `POST /api/review` |
| 权限 | 👤 USER/ADMIN（评价人本人） |
| 对应源码 | [ReviewController.submit()](backend/src/main/java/com/campus/expresshelper/controller/ReviewController.java#L17-L21) |
| 唯一约束 | (order_id, reviewer_id) 组合唯一；同一人对同一单不可重复评价（数据库唯一索引） |

**请求 Body（ReviewSubmitRequest，带范围校验）**：

| 字段 | 类型 | 必填 | 校验 | 说明 |
|------|------|------|------|------|
| `orderId` | Long | ✅ | @NotNull | 订单ID |
| `reviewerId` | Long | ✅ | @NotNull + SelfOrAdmin | 评价人ID = 发单人 |
| `revieweeId` | Long | ✅ | @NotNull | 被评价人ID = 代取员，加分对象 |
| `rating` | Integer | ✅ | 1 ≤ x ≤ 5 | 星级评分 |
| `content` | string | ❌ | 长度≤500 | 文字评价 |

---

### 6.2 按订单查询所有评价
| URL | `GET /api/review/order/{orderId}` | 权限 | 👤 USER/ADMIN |

---

### 6.3 查询某订单的某用户评价（单条）
| URL | `GET /api/review/order/{orderId}/for-user/{userId}` |
|---|---|
| 权限 | 👤 USER/ADMIN（SelfOrAdmin(userId)） |
| 典型场景 | 订单详情页加载"我对该订单的评价内容"以回显 |

---

### 6.4 评价中心（某用户的被评价汇总）
| URL | `GET /api/review/user/{userId}/center` |
|---|---|
| 权限 | 👤 USER/ADMIN（SelfOrAdmin(userId)） |
| 场景 | "我的"页 → 我的评价 |

---

## 7. 📝 实名认证模块（AuthController 除登录外）

### 7.1 提交实名认证申请
| 项 | 值 |
|---|---|
| URL | `POST /api/auth/submit` |
| 权限 | 👤 USER/ADMIN（本人） |
| 对应源码 | [AuthController.submit()](backend/src/main/java/com/campus/expresshelper/controller/AuthController.java#L23-L28) |
| 限制 | 若该用户最新一条记录 status = PENDING，则禁止重复提交 → "已有待审核记录" |

**请求 Body（AuthSubmitRequest，6 字段均必填）**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `userId` | Long | 用户ID（SelfOrAdmin） |
| `studentNo` | string | 学号 |
| `realName` | string | 真实姓名（通过后回写 user_info.username） |
| `idCardFrontUrl` | string | 身份证正面图 URL（建议先调 `/api/upload/auth` 上传拿到 url 再填） |
| `idCardBackUrl` | string | 身份证背面图 URL |
| `idCardWithStudentCardUrl` | string | 手持身份证+学生证合照 URL |

---

### 7.2 查询某用户最新的一条实名认证记录
| URL | `GET /api/auth/latest/{userId}` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|
| 源码 | [AuthController.latest()](backend/src/main/java/com/campus/expresshelper/controller/AuthController.java#L30-L34) | | |

---

## 8. 💳 用户中心模块（UserController 除注册外）

### 8.1 获取个人资料
| URL | `GET /api/user/{id}/profile` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|
| 说明 | password=null，phone=脱敏 | | |

---

### 8.2 修改个人资料（昵称/手机/宿舍/学院）
| 项 | 值 |
|---|---|
| URL | `PUT /api/user/{id}` |
| 权限 | 👤 USER/ADMIN（本人） |
| 源码 | [UserController.updateProfile()](backend/src/main/java/com/campus/expresshelper/controller/UserController.java#L88-L93) |
| 可改字段（仅以下 4 个会被采纳，其他字段忽略） | nickname, phone, dormitory, college |

---

### 8.3 修改密码
| 项 | 值 |
|---|---|
| URL | `PUT /api/user/{id}/password` |
| 权限 | 👤 USER/ADMIN（本人） |
| 源码 | [UserController.updatePassword()](backend/src/main/java/com/campus/expresshelper/controller/UserController.java#L95-L102) |

**请求 Body（Map，无 DTO）**：
```json
{ "oldPassword": "123456", "newPassword": "654321" }
```
校验：原密码匹配 → 新密码长度 6-20 → 新旧不能相同。

---

### 8.4 我的信用积分记录
| URL | `GET /api/user/{id}/credits` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|
| 数据 | `credit_record` 按 created_at 倒序 | | |

---

### 8.5 我的消息列表
| URL | `GET /api/user/{id}/notices` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|

### 8.6 消息未读数（用于 Tabbar 徽标）
| URL | `GET /api/user/{id}/notices/unread-count` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|
| 响应 data | Long，数量（0 表示无未读） | | |

### 8.7 单条消息 标记已读
| URL | `POST /api/user/{id}/notices/{noticeId}/read` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|

### 8.8 单条消息 标记未读
| URL | `POST /api/user/{id}/notices/{noticeId}/unread` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|

### 8.9 全部标记已读
| URL | `POST /api/user/{id}/notices/read-all` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|

### 8.10 删除一条消息
| URL | `DELETE /api/user/{id}/notices/{noticeId}` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|
| 说明 | 物理删除（`deleteById`），非逻辑删除 | | |

---

### 8.11 AI 客服对话
| 项 | 值 |
|---|---|
| URL | `POST /api/user/{id}/ai-chat` |
| 权限 | 👤 USER/ADMIN（本人） |
| 源码 | [UserController.aiChat()](backend/src/main/java/com/campus/expresshelper/controller/UserController.java#L82-L86) |
| 对应服务 | `AiCustomerService.chat(userId, request)` |

**请求 Body（AiChatRequest）**：
```json
{
  "message": "代取费是怎么算的？",
  "history": [
    { "role": "user", "content": "你好" },
    { "role": "assistant", "content": "您好，请问有什么可以帮您？" }
  ]
}
```

---

## 9. 📢 申诉/投诉模块（AppealController）

### 9.1 提交申诉/投诉
| 项 | 值 |
|---|---|
| URL | `POST /api/appeal` |
| 权限 | 👤 USER/ADMIN（发起人本人） |
| 对应源码 | [AppealController.submit()](backend/src/main/java/com/campus/expresshelper/controller/AppealController.java#L17-L21) |
| 服务方法 | [AppealService.submit()](backend/src/main/java/com/campus/expresshelper/service/AppealService.java#L26-L60) |

**请求 Body（AppealSubmitRequest）**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `orderId` | Long | ✅ | 订单ID（订单必须=COMPLETED 或 APPEALING） |
| `initiatorId` | Long | ✅ | 发起人ID（SelfOrAdmin） |
| `appealType` | string | ✅ | **COMPLAINT**=投诉(发单人投诉代取员，initiator=publisher)；**APPEAL**=申诉(代取员申诉评价，initiator=courier)，类型错抛异常 |
| `description` | string | ✅ | 详细描述，≤500字 |
| `evidenceUrls` | string | ❌ | 证据 URL，建议逗号分隔 |

**提交成功后：** `appeal_info.status=PENDING` + `order_info.status=APPEALING` + 发送 APPEAL 通知。

---

### 9.2 查询我的申诉/投诉记录
| URL | `GET /api/appeal/user/{userId}` | 权限 | 👤 USER/ADMIN（本人） |
|---|---|---|---|

---

## 10. 💬 帮助与反馈模块（FeedbackController）

### 10.1 提交反馈
| 项 | 值 |
|---|---|
| URL | `POST /api/feedback` |
| 权限 | 👤 USER/ADMIN（所有已登录用户） |
| 对应源码 | [FeedbackController.submit()](backend/src/main/java/com/campus/expresshelper/controller/FeedbackController.java#L17-L21) |
| userId 来源 | 自动从 JWT 的 `AuthContext.userId()` 取，不传参，更安全 |

**请求 Body（FeedbackSubmitRequest）**：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `feedbackType` | string | ✅ | 白名单枚举，仅允许 4 种：**BUG / SUGGESTION / ACCOUNT / OTHER**（其他值直接报错） |
| `content` | string | ✅ | 反馈内容，1-500字 |

**成功响应 data = Long（反馈ID）**

---

## 11. 📤 文件上传模块（UploadController）
> **注意**：Content-Type 必须为 `multipart/form-data`。上传 URL 自动拼接当前请求的 scheme+host+port，因此**反向代理需正确转发 Host 头**（否则返回的是内网IP）。

### 11.1 上传头像
| 项 | 值 |
|---|---|
| URL | `POST /api/upload/avatar` |
| 权限 | 👤 USER/ADMIN（上传成功后**自动回写**当前 JWT 用户的 `user_info.avatar` 字段） |
| 对应源码 | [UploadController.uploadAvatar()](backend/src/main/java/com/campus/expresshelper/controller/UploadController.java#L35-L51) |
| 目录 | `${upload.path}/avatar/` （upload.path 默认 `./uploads`） |
| 命名规则 | UUID.扩展名（取原文件名后缀） |

**form-data 字段**：
| name | 类型 | 说明 |
|------|------|------|
| `file` | MultipartFile | ✅ 必填，空文件返回 fail "文件不能为空" |

**成功响应**：
```json
{
  "code": 0,
  "message": "ok",
  "data": { "url": "http://localhost:8080/uploads/avatar/64a8a17f-...-58414.jpg" }
}
```

---

### 11.2 上传实名认证图片
| 项 | 值 |
|---|---|
| URL | `POST /api/upload/auth` |
| 权限 | 👤 USER/ADMIN |
| 对应源码 | [UploadController.uploadAuthImage()](backend/src/main/java/com/campus/expresshelper/controller/UploadController.java#L53-L56) |
| 目录 | `${upload.path}/auth/` |
| 说明 | 与头像不同，仅返回 url，不写入任何表；调用方再将 url 填入 `AuthSubmitRequest` 的 3 个字段中 |

---

## 12. 🌐 公共数据模块（PublicController）
> 见 [第 3 章](#3-公共接口免鉴权) （已在白名单部分列出两个接口）

---

## 13. 🔧 管理员模块（AdminController）
> 全部接口前缀 `/api/admin`，**全部要求 `SecurityUtil.assertAdmin()`** → 必须 `role=ADMIN` 的 JWT。普通用户访问 → 返回 `code=-1, message="仅管理员可操作"`。

管理员账号来源：[application.yml](backend/src/main/resources/application.yml#L31-L34) `jwt.admin-username=admin / jwt.admin-password=admin123`。

---

### 13.1 用户管理

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/users` | 用户列表（分页） | Query: `page=1&size=20`。按 created_at 倒序 |
| 2 | POST | `/api/admin/users/{userId}/freeze` | 冻结/解冻用户 | Query: `freezeStatus=1`冻结 / `0`解冻。冻结时同时 `courier_enabled=0` |
| 3 | PUT | `/api/admin/users/{userId}` | 管理员修改用户资料 | Body 传 User 对象，可改昵称/手机/宿舍/学院/**creditScore/greenScore/courierEnabled** |
| 4 | POST | `/api/admin/users/{userId}/courier` | 直接切换代取员权限开关 | Query: `enabled=0/1` |
| 5 | POST | `/api/admin/users/{userId}/reset-password` | 重置密码 | 固定重置为 `123456`（message="密码已重置为 123456"） |

---

### 13.2 实名认证审核

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/auth/pending` | 待审核列表（不分页） | 按 created_at 升序（先提交先审核） |
| 2 | GET | `/api/admin/auth/all` | 所有认证记录，分页 | Query: `page=1&size=20` |
| 3 | POST | `/api/admin/auth/{authId}/approve` | 审核通过 | 🔗 联动：`real_name_auth.status=APPROVED` + `user_info.auth_status=1, courier_enabled=1, username=realName` + 信用分+5(默认) + 发通知 |
| 4 | POST | `/api/admin/auth/{authId}/reject` | 审核驳回 | Query: `reason=驳回原因`（必填）。status=REJECTED + 写 reject_reason + 发通知 |

---

### 13.3 订单管理

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/orders` | 订单列表，分页 | Query: `status`(可选) + `page=1` + `size=20` |
| 2 | GET | `/api/admin/dashboard` | 仪表盘统计 | 数据：totalOrders / completedOrders / pendingGrabOrders / toPickupOrders / deliveringOrders / appealingOrders / cancelledOrders / completionRate(%) |
| 3 | POST | `/api/admin/orders/{orderId}/force-cancel` | 强制取消订单 | Query: `reason`。写 `cancel_type=ADMIN_CANCEL`，给发单人+代取员(若有)各发 ORDER 通知 |
| 4 | GET | `/api/admin/orders/export` | **导出订单 Excel** | Query: `status`(可选)。返回 `orders.xlsx` 二进制流（11 列表头：ID/发单人/代取员/快递公司/快递单号/站点/送达/费用/状态/取消原因/创建时间） |

---

### 13.4 申诉/投诉处理

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/appeals` | 申诉列表，分页 | Query: `page=1&size=20&status=&appealType=`（两筛选均可选） |
| 2 | POST | `/api/admin/appeals/{appealId}/resolve` | 处理申诉 | Query: `status`(写入)+ `result`(处理说明)；**当同订单所有 PENDING 申诉均处理完→自动 order.status 从 APPEALING 回退至 COMPLETED** |

---

### 13.5 反馈处理

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/feedbacks` | 反馈列表，分页 | Query: `page/size/userId(可选)/feedbackType(可选)/status(可选)` |
| 2 | POST | `/api/admin/feedbacks/{feedbackId}/resolve` | 处理并回复反馈 | Query: `reply`(必填, 1-500字)。写入 `status=PROCESSED`，`reply`，`handledBy`=当前JWT管理员ID，`handledAt`=now；发 FEEDBACK 通知给用户 |

---

### 13.6 系统配置管理（信用规则/开关等）

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/configs` | 配置列表 | 返回全部 system_config 记录 |
| 2 | POST | `/api/admin/configs` | 新增/修改配置 | Body=SystemConfig。若带 id=已有则 update，无 id 则 insert。**config_key 唯一** |
| 3 | DELETE | `/api/admin/configs/{id}` | 删除配置 | 物理删除 |

常见可配置项（在代码中通过 `CreditRuleService.rule(key, defaultVal)` 读取）：
- `CREDIT_RULE_AUTH_PASS` → 实名认证通过加分，默认 +5
- `CREDIT_RULE_ORDER_COMPLETE` → 订单完成加分，默认 +2
- `CREDIT_RULE_TIMEOUT` → 接单超时扣分，默认 -10
- `CREDIT_RULE_REVIEW_POSITIVE` → 好评加分，默认 +2

---

### 13.7 快递点管理

| # | 方法 | URL | 功能 | 说明 |
|---|------|-----|------|------|
| 1 | GET | `/api/admin/stations` | 快递点列表（全部，含停用） | 不分页 |
| 2 | POST | `/api/admin/stations` | 新增/修改快递点 | Body=ExpressStation（station_name 唯一） |
| 3 | DELETE | `/api/admin/stations/{id}` | 删除快递点 | 物理删除 |

---

## 14. 🧪 测试接口（TestController，仅开发环境）

> ⚠️ **生产务必删除或加 IP 白名单**，当前仍需 JWT（不在白名单中），但无管理员限制。

| # | 方法 | URL | 功能 |
|---|------|-----|------|
| 1 | GET | `/api/test/users` | 查询所有未删除用户列表 |
| 2 | GET | `/api/test/users-all` | 查询所有用户（OR deleted=1 也查） |

---

## 附录 A：枚举值速查

（完整版本见 [DATA_DICTIONARY.md 第6章](DATA_DICTIONARY.md#6-枚举值汇总速查表)）

| 字段 | 允许值 |
|------|--------|
| **order_info.status**（OrderStatus） | `PENDING_GRAB` / `GRABBED` / `PICKED_UP` / `DELIVERING` / `COMPLETED` / `CANCELLED` / `APPEALING` |
| order_info.cancel_type | `USER_CANCEL` / `ADMIN_CANCEL` |
| real_name_auth.status | `PENDING` / `APPROVED` / `REJECTED` |
| appeal_info.appeal_type | `COMPLAINT`(投诉=发单人→代取员) / `APPEAL`(申诉=代取员→评价) |
| appeal_info.status | `PENDING` / `RESOLVED`（管理员resolve参数直接写入，可扩展） |
| credit_record.type | `CREDIT`(信用) / `GREEN`(绿色积分) |
| notice_info.notice_type | `ORDER` / `AUTH` / `APPEAL` / `FEEDBACK` / `REVIEW` |
| **feedback_info.feedback_type** | 🔒白名单仅4种：`BUG` / `SUGGESTION` / `ACCOUNT` / `OTHER` |
| feedback_info.status | `PENDING` / `PROCESSED` |
| 所有 tinyint 0/1 标志位 | **0=否/关闭/未**；**1=是/启用/已**（auth_status/courier_enabled/freeze_status/allow_bargain/has_review/republished/read_flag/enabled/deleted） |

---

## 附录 B：常见错误 message 对照表

| message 文案 | 触发模块 | 说明 |
|--------------|---------|------|
| `未登录或登录已过期` | JwtInterceptor | Header 未带 Authorization / Bearer Token 解析失败（包括过期） |
| `JWT expired` | 小程序端 app.js 兜底识别 | 识别后强制跳登录 |
| `无权访问该用户数据` | SecurityUtil.assertSelfOrAdmin() | 普通用户尝试查看/修改他人 userId 数据 |
| `仅管理员可操作` | SecurityUtil.assertAdmin() | 非ADMIN role 访问 /api/admin/** |
| `用户不存在` | UserService / AuthService | userId 查不到 |
| `学号已注册 / 用户名已存在 / 手机号已注册` | UserService.register() | 唯一约束冲突 |
| `用户名或密码错误` | UserService.login() | 登录失败 |
| `账号已冻结` | UserService.login() | freeze_status=1 |
| `已有待审核记录` | AuthService.submit() | 该用户最新一条=PENDING |
| `代取员未认证或被禁用` | OrderService.grabOrder() | courier_enabled != 1 |
| `手慢了，订单已经被抢走了` | OrderService.grabOrder() | 三种并发失败（Redis锁失败/状态非PENDING_GRAB/乐观锁version不匹配）均返回这条 |
| `仅支持取消未抢单订单` | OrderService.cancelByPublisher() | status ≠ PENDING_GRAB |
| `该订单已重新发布过，不能重复发布` | OrderService.republishOrder() | republished=1 |
| `反馈类型不正确` | FeedbackService.submit() | feedbackType 不在 {BUG,SUGGESTION,ACCOUNT,OTHER} 内 |
| `文件不能为空` | UploadController.uploadFile() | 上传空文件 |

---

## 附录 C：前端对接注意事项

### C.1 小程序端（已封装 App.request）
[app.js request()](miniprogram/app.js#L40-L79) 已统一：
- 自动注入 `Authorization: Bearer {token}`（token 从 globalData / wx.getStorageSync 取）
- 超时时间 `requestTimeout=10s`
- `success` 回调中识别 `JWT expired / 未登录或登录已过期` → 自动登出+跳登录页
- `fail` 回调中按超时 / localhost / 其他网络 分三档 toast 文案

### C.2 敏感字段脱敏
非订单当事人查询订单列表/详情时，以下字段**已被服务端打码**：
- `expressNo` → 中间打码（`MaskUtil.commonMask`）
- `pickupCode` → 返回 `pickupCodeMasked` 值（发布时已生成的脱敏版）
- `contactPhone` → 138****8000 形式

### C.3 订单自动任务（Redis ZSet 定时）
1. **订单超时扫描**：`@Scheduled cron 0 */1 * * * ?`，KEY=`order:timeout:zset`，score=expireAt秒级时间戳。过期未抢单或已抢单未完成 → status=CANCELLED + 代取员扣信用分（存在则扣）
2. **自动确认收货**：KEY=`order:auto_confirm:zset`，配送中满1小时 → status=COMPLETED + 代取员加分 + **自动 5 星 "系统自动评论" + 好评加分 + 绿色积分**

### C.4 上传返回 URL 的 Host 正确性
上传返回 url = `request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + "/uploads/..."`，若 Nginx 反向代理后返回内网 IP/端口，请在 Nginx 添加：
```
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Port $server_port;
```
并在 Spring 侧启用 `server.forward-headers-strategy=native`。

---

*接口文档结束*
