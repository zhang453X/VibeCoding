# 🏫 校园快递代取互助平台 (Express Helper)

> 面向高校校园场景的快递代取 C2C 互助平台——学生发布代取订单（发布人），其他已实名认证同学在线抢单（代取员），完成取件-配送-签收-评价全闭环，结合**信用积分体系**与**绿色积分环保奖励**驱动高质量订单履约。

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-6DB33F?logo=springboot&logoColor=fff)](#)
[![Java](https://img.shields.io/badge/Java-21-E76F00?logo=oracle&logoColor=fff)](#)
[![MyBatis-Plus](https://img.shields.io/badge/MyBatis--Plus-3.5.7-007396)](#)
[![MySQL](https://img.shields.io/badge/MySQL-8.0.37-4479A1?logo=mysql&logoColor=fff)](#)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis&logoColor=fff)](#)
[![Vue](https://img.shields.io/badge/Vue-3.5.13-4FC08D?logo=vue.js&logoColor=fff)](#)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite&logoColor=fff)](#)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.9.10-409EFF?logo=element&logoColor=fff)](#)
[![WX MiniProgram](https://img.shields.io/badge/%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F-SDK%203.15.0-07C160?logo=wechat&logoColor=fff)](#)

---

## 目录

- [✨ 项目亮点](#-项目亮点)
- [🛠 技术栈 & 版本清单](#-技术栈--版本清单)
- [📁 项目结构](#-项目结构)
- [⚙️ 本地启动指南](#️-本地启动指南)
  - [环境要求](#1-环境要求)
  - [第一步：启动 MySQL 并导入数据库](#2-第一步启动-mysql-并导入数据库)
  - [第二步：启动 Redis](#3-第二步启动-redis)
  - [第三步：修改后端配置并启动](#4-第三步修改后端配置并启动)
  - [第四步：启动管理后台（Vue）](#5-第四步启动管理后台vue)
  - [第五步：运行微信小程序](#6-第五步运行微信小程序)
- [🧑‍💻 功能模块总览](#-功能模块总览)
  - [微信小程序端（学生用户端）](#1-微信小程序端学生用户端)
  - [后端 API 服务](#2-后端-api-服务)
  - [管理后台（Web）](#3-管理后台web)
- [💾 数据库](#-数据库)
- [📄 相关文档索引](#-相关文档索引)
- [🧪 默认账号 & 快速验证](#-默认账号--快速验证)
- [🚀 生产部署建议](#-生产部署建议)
- [📜 License](#-license)

---

## ✨ 项目亮点

| # | 亮点 | 技术实现 |
|---|------|---------|
| 1 | **抢单并发安全** | Redis 分布式锁（KEY=`order:grab:lock:{id}` 10s TTL）+ MySQL 乐观锁 `version` 字段双重保障，避免同一订单被多人抢到 |
| 2 | **订单超时自动取消** | Redis ZSet（score=expireAt 时间戳）+ `@Scheduled` 每分钟扫描，过期未抢单 → 自动 `CANCELLED` + 代取员扣信用分 |
| 3 | **配送超时自动确认收货** | 代取员点击「配送中」后加入 `order:auto_confirm:zset`，满 1 小时 → 自动 `COMPLETED` + **系统 5 星「系统自动评论」** + 绿色积分双倍奖励 |
| 4 | **信用积分 + 绿色积分双体系** | 信用分 0-100（≥60 允许代取），绿色积分无上限，满 100 用户完成订单绿色积分翻倍；规则可热修改（`system_config`） |
| 5 | **敏感字段脱敏** | 订单列表/详情中 `expressNo / pickupCode / contactPhone / phone` 自动打码返回，仅当事人 & 管理员可见明文（见 `MaskUtil`） |
| 6 | **三级权限校验** | JWT 路由拦截 → `SecurityUtil.assertSelfOrAdmin()` 数据级校验 → `assertAdmin()` 角色级校验；白名单仅包含登录/注册/公共快递点 5 条路由 |
| 7 | **反馈类型白名单** | FeedbackService 强制枚举校验，杜绝脏类型写入；`BUG / SUGGESTION / ACCOUNT / OTHER` |
| 8 | **管理后台订单导出** | Apache POI 一键导出 `orders.xlsx`（11 列表头：订单号、发单人、代取员、费用、状态、创建时间等） |
| 9 | **AI 智能客服（预留接口）** | `POST /api/user/{id}/ai-chat` 支持多轮对话历史消息，对接第三方 LLM 只需实现 `AiCustomerService.chat()` |

---

## 🛠 技术栈 & 版本清单

### 后端服务（Spring Boot）
| 组件 | 版本 | 位置 |
|------|------|------|
| **JDK** | **21** (LTS) | `pom.xml` `<java.version>21` |
| Spring Boot | **3.4.5** | `spring-boot-starter-parent` |
| Spring MVC | (同 Boot) | `spring-boot-starter-web` |
| Spring Validation | (同 Boot) | `spring-boot-starter-validation` (Jakarta) |
| Spring Data Redis | (同 Boot) | `spring-boot-starter-data-redis` |
| **MyBatis-Plus** | **3.5.7** (Spring Boot3 专用 starter) | `mybatis-plus-spring-boot3-starter` |
| MySQL Connector | 8.x（Boot 管理） | `mysql-connector-j` |
| **Lombok** | **1.18.36**（编译插件 annotationProcessor） | pom.xml build → maven-compiler-plugin |
| **OpenAPI / Swagger** | **2.8.6**（springdoc-openapi） | 启动后访问 `/swagger-ui.html` |
| JWT (jjwt) | **0.12.6**（api + impl + jackson 三合一） | 签发/解析 HS256 Token，24h 有效 |
| Apache POI (Excel 导出) | **5.4.1** | 订单导出 `orders.xlsx` |
| Java 编译插件 | — | `spring-boot-maven-plugin` |

### 管理后台（Vue 3 + TypeScript）
| 组件 | 版本 | 位置 |
|------|------|------|
| **Vue** | **3.5.13** | `admin-web/package.json` |
| **Vite** | **6.3.5** | 构建工具 |
| **Element Plus** | **2.9.10** | UI 组件库 |
| **Axios** | **1.9.0** | HTTP 客户端 |
| **TypeScript** | **5.8.3** | 类型系统 |
| `@vitejs/plugin-vue` | 5.2.3 | Vite Vue SFC 插件 |

### 微信小程序端
| 项目 | 配置 |
|------|------|
| **框架** | 原生微信小程序（非 uni-app / Taro） |
| **小程序 SDK 基础库** | **v3.15.0** (`libVersion` in project.config.json) |
| AppID | `wxf0076b3419d32f80`（`project.config.json`，可改为你自己的） |
| 项目名 | `campus-express-helper` |
| 编译选项 | ES6 转 ES5 ✔ / 压缩 WXML ✔ / 压缩 WXSS ✔ / 代码自动补全 ✔ / PostCSS ❌ / SWC 关闭 |
| 页面数 | 24 个（全在 [app.json](miniprogram/app.json) 注册，无遗漏） |

### 基础设施
| 组件 | 建议版本 |
|------|---------|
| **MySQL** | **8.0.37**（开发环境，最低兼容 8.0.22+） |
| **Redis** | 7.x+（生产建议 Cluster 或主从 + AOF 持久化；抢单锁、超时队列均依赖它） |
| Nginx（可选） | 1.24+（部署时反向代理前端 + 上传路径转发 + WebSocket） |

---

## 📁 项目结构

```
express-helper-project/
├── backend/                              🟢 Spring Boot 后端 (Java 21)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/campus/expresshelper/
│       │   ├── ExpressHelperApplication.java        ← 启动类（已启用定时任务 + Mapper 扫描）
│       │   ├── common/                              ← ApiResponse / BusinessException / 全局异常处理
│       │   ├── config/                              ← MyBatis-Plus 自动填充、WebMvc（CORS + JWT拦截器白名单）、上传路径、JWT 参数
│       │   ├── controller/ (10个)                   ← Admin / Appeal / Auth / Feedback / Order / Public / Review / Test / Upload / User
│       │   ├── domain/
│       │   │   ├── dto/     (9个 DTO)               ← LoginRequest / OrderCreateRequest / ReviewSubmitRequest ...
│       │   │   ├── entity/  (10个表实体 + BaseEntity)← 对应 10 张数据表
│       │   │   └── enums/   OrderStatus              ← 7 态订单状态
│       │   ├── mapper/   (10个)                     ← MyBatis-Plus BaseMapper 接口
│       │   ├── security/                            ← AuthContext(ThreadLocal) / JwtInterceptor / SecurityUtil 三级鉴权
│       │   ├── service/  (12个)                     ← 业务层（含 AiCustomerService / CreditRuleService 等）
│       │   └── util/                                ← JwtUtil / MaskUtil 脱敏工具
│       └── resources/
│           ├── application.yml                      ← 数据库/Redis/JWT/上传/端口等主配置
│           ├── mapper/                              ← 自定义 XML（若有）
│           └── db/migration/V2/V3/V4*.sql           ← 历史字段变更脚本（MyBatis 迁移参考）
│
├── admin-web/                            🟦 管理后台 (Vue 3 + TS + Vite + Element Plus)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.ts / App.vue
│       ├── api.ts                                       (Axios 封装)
│       └── env.d.ts
│
├── miniprogram/                            🟪 微信小程序 (原生)
│   ├── project.config.json
│   ├── app.js / app.json / app.wxss                        ← 全局配置 + App.request 统一请求
│   ├── sitemap.json
│   ├── images/                                            (Tabbar 图标 + 静态图，33 张)
│   └── pages/
│       ├── login / register                              登录/注册
│       ├── index / order / publish / my-orders / profile  五大 Tab 主页
│       ├── publish-order / publish-history / order-detail 发布/历史/订单详情
│       ├── review / order-review                           评价中心
│       ├── edit-profile / change-password / credit-record  个人资料/密码/信用记录
│       ├── auth                                            实名认证
│       ├── address / address-book / address-edit           地址管理（3页）
│       ├── messages / station-detail / help / about        消息/站点详情/帮助/关于
│
├── express_helper.sql                    💾 完整数据库结构脚本（10张表 + AUTO_INCREMENT 初始值）
├── DATA_DICTIONARY.md                    📘 完整数据字典（10表字段逐一解读）
└── API_DOCUMENT.md                       📗 完整接口文档（58个接口）
```

---

## ⚙️ 本地启动指南

### 1. 环境要求
| 软件 | 最低版本 | 检查命令 |
|------|---------|---------|
| JDK | **21 LTS** | `java -version` (输出应含 `version "21`) |
| Maven | 3.9.x（Spring Boot 3.x 推荐） | `mvn -v` |
| MySQL | **8.0.22+**（开发用 8.0.37） | `mysql -V` |
| Redis | **6.x+**（推荐 7.x） | `redis-cli ping` → `PONG` |
| Node.js | **18+**（Vite 6 需要） | `node -v` |
| pnpm / npm | 任意新版本 | `pnpm -v` 或 `npm -v` |
| 微信开发者工具 | 最新稳定版 | [官网下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) |

---

### 2. 第一步：启动 MySQL 并导入数据库

```bash
# 1. 以 root 登录，创建数据库 + 授权用户
mysql -u root -p
```
```sql
CREATE DATABASE express_helper
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_0900_ai_ci;

-- 可选：创建应用专用账号（对应 application.yml 中你自行填写的账号密码）
CREATE USER 'express_user'@'localhost' IDENTIFIED BY 'your_mysql_password';
GRANT ALL PRIVILEGES ON express_helper.* TO 'express_user'@'localhost';
FLUSH PRIVILEGES;
USE express_helper;

-- 2. 导入完整 SQL 脚本（项目根目录）
SOURCE ./express_helper.sql;
-- 核对：应返回 10 张表
SHOW TABLES;
```

✅ **预期输出**：`appeal_info`、`credit_record`、`express_station_info`、`feedback_info`、`notice_info`、`order_info`、`order_review`、`real_name_auth`、`system_config`、`user_info`（共 10 张）。

---

### 3. 第二步：启动 Redis

开发环境最简单：
```bash
# Windows（用 Chocolatey 或 WSL）
redis-server

# 验证
redis-cli ping
# 返回 PONG 即 OK（本地无密码，端口 6379，DB 0）
```
> 生产务必配置 `requirepass` 密码并在 `application.yml` 的 `spring.data.redis.password` 里填上。

---

### 4. 第三步：修改后端配置并启动

配置文件位置：**[backend/src/main/resources/application.yml](backend/src/main/resources/application.yml)**

通常只需改以下 4 处即可本地启动：
```yaml
server:
  port: 8080                               # ① 后端端口（若改了要同步改小程序 app.js 第 7 行 + 管理后台 api.ts）

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/express_helper?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
    username: your_mysql_user               # ② 改成你本地 MySQL 账号
    password: "your_mysql_password"         # ③ 改成你本地 MySQL 密码
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
      # password: your_redis_password       # ④ 生产放开这一行

jwt:
  secret: your_long_random_jwt_secret       # ⚠️ 请改成 256 位以上强随机串（HS256 要求）
  expire-hours: 24
  admin-username: your_admin_username
  admin-password: your_admin_password       # 管理员账号（登录用 role=ADMIN）
```

**启动方式（二选一）：**

**方式 A — Maven 命令行：**
```bash
cd backend
mvn clean spring-boot:run
```
**方式 B — IDEA：** 打开 [ExpressHelperApplication.java](backend/src/main/java/com/campus/expresshelper/ExpressHelperApplication.java) → 右键 Run。

✅ **启动成功后验证：**
- 健康检查：浏览器访问 http://localhost:8080/api/public/express-stations → `{"code":0,...,"data":[...]}`
- Swagger 在线文档：http://localhost:8080/swagger-ui.html
- OpenAPI 3 JSON：http://localhost:8080/v3/api-docs

---

### 5. 第四步：启动管理后台（Vue）

```bash
cd admin-web

# 1. 安装依赖（首次）
npm install
# 或 pnpm i （推荐）

# 2. 本地开发启动（默认端口 5173）
npm run dev
```
Vite 启动后终端会显示 `http://localhost:5173/`，浏览器打开即可。  
管理员登录账号见上方 `application.yml` 中你自行配置的 `admin-username / admin-password`，登录时 **`role` 字段必须传 `ADMIN`**。

生产构建：
```bash
npm run build
# 产物：admin-web/dist/（Nginx root 指向该目录即可）
```

---

### 6. 第五步：运行微信小程序

1. 打开微信开发者工具 → 「导入项目」
   - 目录选：项目根目录下的 **`miniprogram`** 文件夹
   - AppID：使用自己的小程序测试号 / 正式号（或选择「测试号」），原配置里的 `wxf0076b3419d32f80` 仅供参考
   - 项目名随意 → 导入

2. **关键配置（必改）**：
   - **后端接口地址**：打开 **[miniprogram/app.js](miniprogram/app.js)**，第 7 行 `this.globalData.baseUrl = 'http://localhost:8080'` → 改成你后端 IP+端口（真机调试必须用后端所在电脑的局域网 IP，如 `http://192.168.1.5:8080`，不能用 localhost）
   - **小程序后台配置 request 合法域名**：正式版需在 微信公众平台 → 开发管理 → 服务器域名 → request合法域名 添加你的 HTTPS 后端域名；**开发期勾选「开发者工具 → 详情 → 本地设置 → 不校验合法域名」** 即可。

3. 点击「编译」→ 进入登录页 → 用第「🧪 默认账号」里的学生账密登录即可体验。

---

## 🧑‍💻 功能模块总览

### 1. 微信小程序端（学生用户端）
**Tabbar 5 大主页面**：[首页] 🏠 / [任务大厅] 📦 / [发布] ✏️ / [我的订单] 📋 / [我的] 👤

| 模块 | 子功能 | 说明 |
|------|--------|------|
| **账户** | 注册 / 登录 / 修改密码 / 冻结检测 | 学号+昵称+手机+密码注册，密码 6-20 位；手机/学号/用户名三字段唯一 |
| **实名认证** | 3 张图上传（身份证正/背/手持+学生证） | 审核通过自动 `authStatus=1` + `courierEnabled=1` + 信用+5 分 |
| **订单** | 发布订单 / 抢单 / 取件 / 配送 / 完成 / 取消 / 重发 | ① 发布：有效期（分钟）+ 费用≥0.1 元；② 抢单：Redis+乐观锁并发安全；③ 仅 PENDING_GRAB 可取消；④ CANCELED 仅可重发 1 次 |
| **评价** | 手动评价 / 系统自动 5 星评价 | 超 1 小时未确认 → 自动完成 + "系统自动评论" + 绿色积分 |
| **积分** | 信用积分 + 绿色积分 | 满 60 才能开通代取；超分自动夹逼 0-100 |
| **消息** | 订单/认证/申诉/反馈/评价 五类推送 | Tabbar 徽标未读数 + 已读/未读/删除/全部已读 |
| **申诉投诉** | 发单人投诉代取员 / 代取员申诉评价 | 订单状态自动切 APPEALING，处理完自动回退 COMPLETED |
| **反馈** | BUG/建议/账号/其他（白名单） | 管理员回复后发通知 |
| **站点信息** | 公共快递点列表+详情（高德经纬度+营业时间） | 发布订单下拉数据源 |
| **AI 客服** | `/ai-chat` 多轮对话接口 | 接入 LLM 只需实现 `AiCustomerService.chat()` |

---

### 2. 后端 API 服务
58 个 REST 接口，按权限分三层：

| 模块 | 前缀 | 接口数 | 权限 | 代表接口 |
|------|------|-------|------|---------|
| 公共开放 | `/api/public` | 2 | 免鉴权 | 快递点列表/详情 |
| 认证/账号 | `/api/auth`、`/api/user` | 13 | 登录/本人/管理员 | 登录、注册、我的资料、改密码、信用、消息、AI |
| 订单 | `/api/order` | 9 | 本人/管理员 | 发布、大厅、详情、抢单、状态流转、取消、重发、我的 |
| 评价 | `/api/review` | 4 | 本人 | 提交、按订单查、评价中心 |
| 实名认证 | `/api/auth/submit` + `latest` | 2 | 本人 | 提交+查询最新 |
| 申诉投诉 | `/api/appeal` | 2 | 本人+管理员 | 提交、我的列表 |
| 反馈 | `/api/feedback` | 1 | 本人 | 提交（4类白名单） |
| 上传 | `/api/upload` | 2 | 本人 | 头像（自动回写）、认证图 |
| **管理员** | `/api/admin` | **23** | 🔒 仅 ADMIN | 用户/认证/订单/申诉/反馈/配置/站点 + 仪表盘 + Excel 导出 |
| 测试接口 | `/api/test` | 2 | JWT | 查用户列表（开发用） |

详细接口文档参见 [API_DOCUMENT.md](API_DOCUMENT.md)。

---

### 3. 管理后台（Web）
| 模块 | 核心功能 |
|------|---------|
| 仪表盘 Dashboard | 8 项指标：总订单、完成数、待抢、待取、配送中、申诉中、取消数、完成率% |
| 用户管理 | 分页列表 / 冻结解冻 / 编辑资料（含信用/绿色积分）/ 切换代取权 / 重置密码(→123456) |
| 认证审核 | 待审核列表 / 全部列表 / 通过 / 驳回（驳回原因必填） |
| 订单管理 | 筛选+分页 / 强制取消 / **一键导出 orders.xlsx** |
| 申诉处理 | 按状态/类型筛选 / 处理结果回复 |
| 反馈处理 | 按用户/类型/状态筛选 / 回复 + 发通知 |
| 系统配置 | 热增删改查（信用规则 CREDIT_RULE_* 等），无需重启后端 |
| 快递点管理 | 增删改查（高德经纬度 / 启用开关 / 排序） |

---

## 💾 数据库

### 10 张数据表速览
| # | 表名 | 中文名 | 量级 (AUTO_INCREMENT) | 关键字段 |
|---|------|--------|----------------------|---------|
| 1 | `user_info` | 用户 | 27 | 学号唯一；初始信用 60 / 绿色 0 |
| 2 | `order_info` | 订单 | 106 | 7 态 status / expireAt / version 乐观锁 |
| 3 | `order_review` | 评价 | 15 | (order_id, reviewer_id) 唯一 |
| 4 | `real_name_auth` | 实名认证 | 26 | PENDING / APPROVED / REJECTED |
| 5 | `express_station_info` | 快递点 | 9 | station_name 唯一 + 高德经纬度 |
| 6 | `appeal_info` | 申诉/投诉 | 36 | COMPLAINT / APPEAL 类型 |
| 7 | `credit_record` | 积分流水 | 59 | CREDIT / GREEN 双类型 |
| 8 | `notice_info` | 消息通知 | 260 | 5 类 notice_type + read_flag |
| 9 | `feedback_info` | 反馈 | 17 | 状态 PENDING / PROCESSED + 双索引 |
| 10 | `system_config` | 系统配置 | 12 | config_key 唯一 + enabled 开关 |

数据库完整字段解读：👉 [DATA_DICTIONARY.md](DATA_DICTIONARY.md)（每个字段的类型/约束/必填/业务说明/枚举值/业务链联动）

---

## 📄 相关文档索引

| 文档 | 文件位置 | 说明 |
|------|---------|------|
| 🌐 完整接口文档 | [API_DOCUMENT.md](API_DOCUMENT.md) | 58 个接口的 URL/方法/权限/参数/示例/错误 message 全部列出 |
| 🗄 完整数据字典 | [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | 10 张表的字段逐一说明 + ER 关系图 + 9 条业务写表链 |
| 💾 数据库脚本 | [express_helper.sql](express_helper.sql) | MySQL 8.0.37 导出，直接 SOURCE 即可建库 |
| 🎨 在线 API 调试 | http://localhost:8080/swagger-ui.html | 本地启动后端后可直接调试所有接口（已配 springdoc） |

---

## 🧪 默认账号 & 快速验证

启动后端 + 导入 SQL 后，推荐以下链路快速跑通核心流程：

| 账号类型 | 用户名 | 密码 | 登录时 role | 用途 |
|---------|--------|------|------------|------|
| 🛠 管理员 | `application.yml` 中自定义 | `application.yml` 中自定义 | `ADMIN` | 登录管理后台 → 审核认证 / 处理反馈等 |
| 🧑‍🎓 学生A (发单人) | 任意学号 → 自行注册（`POST /api/user/register`） | 自设 6-20 位 | `USER`（默认） | 发布订单 → 取消 / 确认收货 / 评价 / 投诉 |
| 👷 学生B (代取员) | 任意学号 → 注册 → 提交实名认证 → 管理员审核通过 | 同上 | `USER` | 开通代取权 → 抢单 → 推进状态 |

### 🔁 快速跑通闭环（推荐 5 分钟自测清单）

1. 注册学生 A、学生 B → 学生B 用「上传 3 张图 → 提交实名认证」
2. 管理员登录管理后台 → 待审核列表 → 通过 B 的认证 → B 的 courierEnabled 自动 =1，信用+5
3. A 发布一条代取订单（费用 2 元，有效期 30 分钟，站点=菜鸟驿站东区）
4. B 登录小程序 → 任务大厅 → 抢单 → 连续点两次抢单，第二次提示"手慢了"（并发锁生效）
5. B 依次点 "已取件 → 配送中 → 已完成"（状态流转）
6. A 确认收货或等 1 小时 → 订单 COMPLETED，B 的绿色积分自动+2
7. A 评价 → 5星好评 → B 再+2 信用；或 A 对 B 投诉 → 订单 APPEALING → 管理员处理 → 回 COMPLETED
8. 管理后台 → 仪表盘 验证 totalOrders=1 / completionRate / pending=0 / delivering=0 等指标更新
9. 管理后台 → 订单 → 导出 orders.xlsx → 打开 Excel 核对 11 列表头正确

---

## 🚀 生产部署建议

### 🎯 推荐架构（单台 4C8G 云主机即可起步）
```
用户 → 小程序/管理后台 → Nginx (HTTPS + Host转发) → 
    ├── /api/*          → Spring Boot (:8080)
    ├── /uploads/*      → 直读静态文件目录（如 /data/express-helper/uploads）
    └── /               → Vue3 dist 目录静态托管
    同时独立部署：MySQL 8（建议开启 binlog + 定时备份）、Redis 7（AOF 持久化）
```

### ⚠️ 上线前务必做的 8 件事
| # | 事项 | 说明 |
|---|------|------|
| 1 | **修改 `jwt.secret`** | application.yml 中的默认 `campus-express-helper-jwt-secret-key-2026` 必须换成 256+ 位强随机字符串 |
| 2 | **修改管理员账号密码** | `admin123` → 12+ 位强密码；或新增 RBAC 多管理员表（当前写死在 yml 中） |
| 3 | **MySQL / Redis 加密码** | datasource.password / redis.password 别用默认；建议内网部署 |
| 4 | **配置 HTTPS** | 小程序要求所有 request 合法域名必须 https；上传返回 URL 才能正确拼接 https |
| 5 | **Nginx Host 头转发** | `proxy_set_header Host $host; X-Forwarded-Proto $scheme;`，否则 `/api/upload` 返回的 URL 会是内网 IP |
| 6 | **删除 /api/test 接口** | 或在 Nginx 层拦截；仅开发用 |
| 7 | **恢复 MyBatis-Plus 全局逻辑删除** | application.yml 中 `mybatis-plus.global-config.db-config` 已被注释，删除数据时恢复可避免误物理删 |
| 8 | **密码加密存储** | 当前 user_info.password 明文存储，建议接入 Spring Security + BCryptPasswordEncoder |

### 🚚 后端打包 & 启动（systemd 示例）
```bash
# 后端打包 jar（跳过 test 更快）
cd backend
mvn clean package -DskipTests
# 产物：target/express-helper-1.0.0.jar
```
```ini
# /etc/systemd/system/express-helper.service
[Unit]
Description=Campus Express Helper Backend
After=network.target mysql.service redis.service

[Service]
User=www
WorkingDirectory=/data/express-helper
ExecStart=/usr/bin/java -Xms2g -Xmx2g -XX:+UseG1GC \
    -Duser.timezone=Asia/Shanghai \
    -Dfile.encoding=UTF-8 \
    -jar express-helper-1.0.0.jar \
    --spring.profiles.active=prod
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```
```bash
# 启动 & 开机自启
systemctl daemon-reload
systemctl enable --now express-helper
journalctl -u express-helper -f     # 查看日志
```

---

## 📜 License

校园快递代取互助平台 / Express Helper — 学习交流使用，欢迎 Fork + Issue。
