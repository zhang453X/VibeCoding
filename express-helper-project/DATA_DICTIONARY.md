# 校园快递代取助手 - 完整数据字典

> **数据库版本**：MySQL 8.0.37  
> **字符集**：utf8mb4 / utf8mb4_0900_ai_ci  
> **项目架构**：Spring Boot 3.4.5 + MyBatis-Plus + Redis + Vue 3 + 微信小程序  

---

## 目录

1. [项目整体架构概览](#1-项目整体架构概览)
2. [表清单总览](#2-表清单总览)
3. [各表详细数据字典](#3-各表详细数据字典)
   - 3.1 [user_info - 用户信息表](#31-user_info---用户信息表)
   - 3.2 [order_info - 订单信息表](#32-order_info---订单信息表)
   - 3.3 [order_review - 订单评价表](#33-order_review---订单评价表)
   - 3.4 [real_name_auth - 实名认证申请表](#34-real_name_auth---实名认证申请表)
   - 3.5 [express_station_info - 校内快递点信息表](#35-express_station_info---校内快递点信息表)
   - 3.6 [appeal_info - 申诉/投诉信息表](#36-appeal_info---申诉投诉信息表)
   - 3.7 [credit_record - 信用/积分变动记录表](#37-credit_record---信用积分变动记录表)
   - 3.8 [notice_info - 消息通知表](#38-notice_info---消息通知表)
   - 3.9 [feedback_info - 帮助与反馈表](#39-feedback_info---帮助与反馈表)
   - 3.10 [system_config - 系统配置表](#310-system_config---系统配置表)
4. [通用字段说明（所有表共有）](#4-通用字段说明所有表共有)
5. [表间关联关系与业务流程](#5-表间关联关系与业务流程)
6. [枚举值汇总速查表](#6-枚举值汇总速查表)

---

## 1. 项目整体架构概览

### 1.1 三端结构

| 模块 | 目录 | 技术栈 | 说明 |
|------|------|--------|------|
| 微信小程序端 | [miniprogram/](miniprogram) | 原生微信小程序 | 学生用户端：发布订单、抢单、实名认证、评价、地址管理等 |
| 后端服务 | [backend/](backend) | Spring Boot 3.4.5 + MyBatis-Plus 3.5.7 + MySQL 8 + Redis + JWT | RESTful API 服务，包含 10 个 Controller、12 个 Service、10 个 Mapper |
| 管理后台 | [admin-web/](admin-web) | Vue 3.5 + TypeScript + Vite 6 + Element Plus + Axios | 管理员端：审核认证、处理申诉/反馈、订单管理、用户管理 |

### 1.2 后端分层结构

```
backend/src/main/java/com/campus/expresshelper/
├── common/        # 通用：ApiResponse、BusinessException、GlobalExceptionHandler
├── config/        # 配置：JwtProperties、MyBatis-Plus、WebMvc、WebConfig（上传路径）
├── controller/    # 10个控制器：Admin、Appeal、Auth、Feedback、Order、Public、Review、Test、Upload、User
├── domain/
│   ├── dto/       # 9个 DTO 请求对象
│   ├── entity/    # 10个数据库实体（对应下方10张表）
│   └── enums/     # 枚举：OrderStatus（7种订单状态）
├── mapper/        # 10个 MyBatis-Plus Mapper
├── security/      # 安全：AuthContext、JwtInterceptor、SecurityUtil
├── service/       # 12个业务服务
└── util/          # 工具：JwtUtil、MaskUtil（脱敏）
```

### 1.3 核心业务流程

1. **注册** → 学号/用户名/手机号/密码校验 → 写入 `user_info`（初始信用60分，未认证，未开通代取）
2. **实名认证** → 提交 `real_name_auth` → 管理员审核通过 → `user_info.auth_status=1` + `courier_enabled=1` + 信用加分
3. **发布订单** → 创建 `order_info`（状态=PENDING_GRAB，加入Redis超时队列）
4. **抢单** → Redis分布式锁 + 乐观锁（version字段）→ 状态=GRABBED
5. **状态流转** → PENDING_GRAB → GRABBED → PICKED_UP → DELIVERING → COMPLETED（信用加分+绿色积分）
6. **评价** → `order_review` 唯一索引 (order_id, reviewer_id) → 代取员加分
7. **申诉/投诉** → `appeal_info` → 订单状态转 APPEALING → 处理完成恢复

---

## 2. 表清单总览

| 序号 | 表名 | 中文名 | 记录量级 (AUTO_INCREMENT) | 核心索引 | 来源文件 |
|------|------|--------|--------------------------|---------|---------|
| 1 | `user_info` | 用户信息表 | 27 | `student_no` (唯一) | [User.java](backend/src/main/java/com/campus/expresshelper/domain/entity/User.java) |
| 2 | `order_info` | 订单信息表 | 106 | 无显式二级索引（建议按 status/publisher_id/courier_id 加索引） | [OrderInfo.java](backend/src/main/java/com/campus/expresshelper/domain/entity/OrderInfo.java) |
| 3 | `order_review` | 订单评价表 | 15 | `order_reviewer_unique` (order_id, reviewer_id) 唯一 | [OrderReview.java](backend/src/main/java/com/campus/expresshelper/domain/entity/OrderReview.java) |
| 4 | `real_name_auth` | 实名认证申请表 | 26 | 无显式二级索引（建议 user_id + created_at） | [RealNameAuth.java](backend/src/main/java/com/campus/expresshelper/domain/entity/RealNameAuth.java) |
| 5 | `express_station_info` | 校内快递点信息表 | 9 | `uk_station_name` (station_name) 唯一 | [ExpressStation.java](backend/src/main/java/com/campus/expresshelper/domain/entity/ExpressStation.java) |
| 6 | `appeal_info` | 申诉/投诉信息表 | 36 | 无显式二级索引（建议 order_id + initiator_id + status） | [Appeal.java](backend/src/main/java/com/campus/expresshelper/domain/entity/Appeal.java) |
| 7 | `credit_record` | 信用/积分变动记录表 | 59 | 无显式二级索引（建议 user_id + created_at） | [CreditRecord.java](backend/src/main/java/com/campus/expresshelper/domain/entity/CreditRecord.java) |
| 8 | `notice_info` | 消息通知表 | 260 | 无显式二级索引（建议 user_id + read_flag + created_at） | [NoticeInfo.java](backend/src/main/java/com/campus/expresshelper/domain/entity/NoticeInfo.java) |
| 9 | `feedback_info` | 帮助与反馈表 | 17 | `idx_feedback_user_id`、`idx_feedback_status` | [Feedback.java](backend/src/main/java/com/campus/expresshelper/domain/entity/Feedback.java) |
| 10 | `system_config` | 系统配置表 | 12 | `config_key` (唯一) | [SystemConfig.java](backend/src/main/java/com/campus/expresshelper/domain/entity/SystemConfig.java) |

---

## 3. 各表详细数据字典

> **说明**：所有表均继承自 `BaseEntity`，包含 `created_at`、`updated_at`、`deleted` 三个通用字段（详见第4章）。

### 3.1 user_info - 用户信息表

**表注释**：系统用户（学生）核心信息表，包含登录凭证、认证状态、信用分、代取权限。  
**对应实体**：[User.java](backend/src/main/java/com/campus/expresshelper/domain/entity/User.java)  
**对应服务**：[UserService.java](backend/src/main/java/com/campus/expresshelper/service/UserService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 用户主键ID | |
| `open_id` | varchar(64) | NULL | String | ❌ | 微信小程序 openid（预留字段，当前登录为学号+密码） | |
| `student_no` | varchar(64) | NOT NULL, UNIQUE | String | ✅ | 学号 | 正则: `^[0-9A-Za-z]{6,20}$`，注册唯一校验 |
| `username` | varchar(64) | NULL | String | 条件 | 用户名（登录账号），留空时默认=学号 | 正则: `^[0-9A-Za-z_]{4,20}$`，唯一 |
| `nickname` | varchar(64) | NULL | String | ✅ | 昵称 | 长度 2-20 位 |
| `phone` | varchar(32) | NULL | String | ✅ | 手机号 | 正则: `^1[3-9]\d{9}$`，唯一；对外返回脱敏（见MaskUtil） |
| `password` | varchar(128) | NULL | String | ✅ | 登录密码（明文存储，⚠️建议BCrypt加密） | 长度 6-20 位；接口返回始终=null |
| `auth_status` | tinyint | DEFAULT 0 | Integer | ✅ | 实名认证状态 | **0**=未认证；**1**=已认证（APPROVED后置1） |
| `courier_enabled` | tinyint | DEFAULT 0 | Integer | ✅ | 代取员权限开关 | **0**=不可抢单；**1**=可抢单（认证通过自动置1，冻结时自动置0） |
| `credit_score` | int | DEFAULT 60 | Integer | ✅ | 信用积分 | 初始=60；范围 0-100（超限时夹逼）；完成订单+2，超时-10 |
| `green_score` | int | DEFAULT 0 | Integer | ✅ | 绿色积分（环保/贡献） | 初始=0；满100分用户完成订单绿色积分翻倍 |
| `freeze_status` | tinyint | DEFAULT 0 | Integer | ✅ | 账号冻结状态 | **0**=正常；**1**=冻结（禁止登录） |
| `dormitory` | varchar(100) | NULL | String | ❌ | 宿舍地址（送达地点的基础/默认值） | |
| `college` | varchar(100) | NULL | String | ❌ | 学院 | |
| `avatar` | varchar(512) | NULL | String | ❌ | 头像URL | 通过 /api/upload/avatar 上传，格式 `/uploads/avatar/{uuid}.jpg` |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间（MP插入自动填充） | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间（MP插入/更新自动填充） | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | **0**=有效；**1**=删除（当前application.yml已禁用逻辑删除） |

---

### 3.2 order_info - 订单信息表

**表注释**：快递代取订单表，核心业务表。发单人发布，代取员抢单，全程状态流转。  
**对应实体**：[OrderInfo.java](backend/src/main/java/com/campus/expresshelper/domain/entity/OrderInfo.java)  
**对应枚举**：[OrderStatus.java](backend/src/main/java/com/campus/expresshelper/domain/enums/OrderStatus.java)  
**对应服务**：[OrderService.java](backend/src/main/java/com/campus/expresshelper/service/OrderService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 订单主键ID | |
| `publisher_id` | bigint | NOT NULL | Long | ✅ | 发单人用户ID | FK → `user_info.id`（逻辑关联，无物理外键） |
| `courier_id` | bigint | NULL | Long | ❌ | 代取员用户ID（抢单后填充） | FK → `user_info.id`；抢单成功后由 Redis锁+乐观锁写入 |
| `express_company` | varchar(64) | NOT NULL | String | ✅ | 快递公司名称 | 例：顺丰、中通、京东、圆通等 |
| `express_no` | varchar(64) | NOT NULL | String | ✅ | 快递单号 | 列表页返回脱敏（中间打码，见MaskUtil） |
| `pickup_code_masked` | varchar(64) | NOT NULL | String | ✅ | 取件码(脱敏版) | 发布时自动由 MaskUtil.pickupCodeMask() 生成 |
| `pickup_code` | varchar(64) | NULL | String | 条件 | 真实取件码 | **仅发单人/代取员/管理员可见**；其他用户返回masked值 |
| `station_name` | varchar(64) | NOT NULL | String | ✅ | 取件快递点名称 | 对应 `express_station_info.station_name`（逻辑关联，用于列表筛选） |
| `express_type` | varchar(32) | NOT NULL | String | ✅ | 快递类型/大小 | 列表筛选字段；常见：小型、中型、大型、超重等（由前端枚举） |
| `pickup_time_range` | varchar(64) | NOT NULL | String | ✅ | 取件时间段（要求） | 例："10:00-12:00"、"今天下午" |
| `delivery_location` | varchar(128) | NOT NULL | String | ✅ | 送达地点（学校内） | 例："东区12号楼楼下"、"南苑宿舍" |
| `remark` | varchar(255) | NULL | String | ❌ | 备注说明 | |
| `fee` | decimal(10,2) | NOT NULL | BigDecimal | ✅ | 代取服务费（元） | 精度 2位小数 |
| `contact_phone` | varchar(20) | NULL | String | ❌ | 联系电话（订单专用） | 返回脱敏；若=空使用 user_info.phone |
| `delivery_completed_at` | datetime | NULL | LocalDateTime | ❌ | 配送完成时间（代取员点击"配送中"时记录） | 状态进入 DELIVERING 时写入；用于后续自动确认(1小时后) |
| `allow_bargain` | tinyint | DEFAULT 0 | Integer | ✅ | 是否允许议价 | **0**=一口价；**1**=允许议价 |
| `status` | varchar(32) | NOT NULL | String | ✅ | 订单状态 | **7种枚举**，详见下方 |
| `expire_at` | datetime | NOT NULL | LocalDateTime | ✅ | 订单过期时间（未抢单超时） | 默认：发布时 +validMinutes 分钟；Redis ZSet KEY=order:timeout:zset，每分钟扫描 |
| `version` | int | DEFAULT 0 | Integer | ✅ | 乐观锁版本号 | 抢单时：`WHERE version=? AND id=?`，成功后 version+1 |
| `cancel_reason` | varchar(128) | NULL | String | ❌ | 取消原因 | 例："用户主动取消" / "超时自动取消" / "管理员强制取消" |
| `cancel_type` | varchar(20) | NULL | String | ❌ | 取消类型 | **USER_CANCEL**=用户自己取消；**ADMIN_CANCEL**=管理员强制取消 |
| `has_review` | int | DEFAULT 0 | Integer | ✅ | 是否已评价标记 | **0**=未评价；**1**=已评价（含系统自动好评） |
| `republished` | tinyint | DEFAULT 0 | Integer | ✅ | 是否已重新发布标记 | **0**=未重发；**1**=已重发（限制只能重发1次） |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

#### 订单状态枚举（7种，OrderStatus）及状态流转图

| 枚举值 | 中文说明 | 可流转至 | 触发操作 |
|--------|---------|---------|---------|
| `PENDING_GRAB` | 待抢单 | → GRABBED → CANCELLED | 发单用户发布；每分钟扫描超时自动CANCELLED |
| `GRABBED` | 已抢单（已接单） | → PICKED_UP → DELIVERING → CANCELLED | 代取员抢单成功 |
| `PICKED_UP` | 已取件 | → DELIVERING → COMPLETED | 代取员已从快递点取出 |
| `DELIVERING` | 配送中 | → COMPLETED | 代取员已到达送达点附近；写入 delivery_completed_at，并加入自动确认队列（1小时） |
| `COMPLETED` | 已完成 | → APPEALING | 发单人确认收货或系统自动确认；代取员+信用分 |
| `CANCELLED` | 已取消 | （终止态） | 用户主动取消 / 超时自动取消 / 管理员强制取消 |
| `APPEALING` | 申诉中 | → COMPLETED | 提交 COMPLAINT/APPEAL 后置；所有 PENDING 申诉处理完后置回 COMPLETED |

**状态流转合法性校验**在 OrderService.isValidStatusTransition() 中强制约束。

---

### 3.3 order_review - 订单评价表

**表注释**：订单完成后由发单人评价代取员的评价记录（支持系统自动5星好评）。  
**对应实体**：[OrderReview.java](backend/src/main/java/com/campus/expresshelper/domain/entity/OrderReview.java)  
**对应服务**：[ReviewService.java](backend/src/main/java/com/campus/expresshelper/service/ReviewService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 评价主键ID | |
| `order_id` | bigint | NOT NULL, UNIQUE(组合) | Long | ✅ | 关联订单ID | FK → `order_info.id`；组合唯一索引字段1 |
| `reviewer_id` | bigint | NOT NULL, UNIQUE(组合) | Long | ✅ | 评价人用户ID（发单人） | FK → `user_info.id`；组合唯一索引字段2；系统自动评价时=发单人ID |
| `reviewee_id` | bigint | NOT NULL | Long | ✅ | 被评价人用户ID（代取员） | FK → `user_info.id`；评价加分对象 |
| `rating` | int | NOT NULL | Integer | ✅ | 评分（星级） | **1-5** 整数；系统自动评价固定=5 |
| `content` | varchar(500) | NULL | String | ❌ | 评价文字内容 | 系统自动评价固定="系统自动评论" |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

**唯一约束**：`order_reviewer_unique (order_id, reviewer_id)` —— 限制同一人对同一订单只能评价一次。

**业务联动**：评价写入后，`order_info.has_review = 1`，并根据 rating 给予代取员 CREDIT 加分（默认好评+2）+ GREEN 绿色积分。

---

### 3.4 real_name_auth - 实名认证申请表

**表注释**：学生用户开通代取员权限必须提交的实名认证记录（学号+姓名+身份证+学生证）。  
**对应实体**：[RealNameAuth.java](backend/src/main/java/com/campus/expresshelper/domain/entity/RealNameAuth.java)  
**对应服务**：[AuthService.java](backend/src/main/java/com/campus/expresshelper/service/AuthService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 认证记录ID | |
| `user_id` | bigint | NOT NULL | Long | ✅ | 申请用户ID | FK → `user_info.id` |
| `student_no` | varchar(64) | NOT NULL | String | ✅ | 学号 | 需与 user_info.student_no 一致（业务强制一致，代码未校验差异） |
| `real_name` | varchar(64) | NOT NULL | String | ✅ | 真实姓名 | 审核通过后回写 user_info.username=real_name |
| `id_card_front_url` | varchar(512) | NULL | String | ❌ | 身份证正面照片URL | `/uploads/auth/{uuid}.jpg`，通过 /api/upload/auth 上传 |
| `id_card_back_url` | varchar(512) | NULL | String | ❌ | 身份证背面照片URL | 同上 |
| `id_card_with_student_card_url` | varchar(512) | NULL | String | ❌ | 手持身份证+学生证合照URL | 同上 |
| `status` | varchar(32) | NOT NULL | String | ✅ | 审核状态 | **PENDING**=待审核 / **APPROVED**=通过 / **REJECTED**=驳回 |
| `reject_reason` | varchar(255) | NULL | String | ❌ | 驳回原因（仅驳回时填充） | |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

**业务约束**：同一 user_id 若最新的一条状态为 PENDING，则禁止重复提交（AuthService.submit() 校验）。  
**审核通过联动**：`user_info.auth_status=1` + `courier_enabled=1` + `username=real_name` + 信用分 CREDIT_RULE_AUTH_PASS 默认+5。

---

### 3.5 express_station_info - 校内快递点信息表

**表注释**：校园内各快递站点信息（支持高德经纬度/POI），作为发布订单的站点选择下拉数据源。  
**对应实体**：[ExpressStation.java](backend/src/main/java/com/campus/expresshelper/domain/entity/ExpressStation.java)  
**对应服务**：[ExpressStationService.java](backend/src/main/java/com/campus/expresshelper/service/ExpressStationService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 快递点ID | |
| `station_name` | varchar(64) | NOT NULL, UNIQUE | String | ✅ | 快递点名称 | 唯一索引 uk_station_name；例："菜鸟驿站(东区)"、"京东服务点" |
| `campus_area` | varchar(64) | NULL | String | ❌ | 校区区域 | 例："东区"、"西区"、"南苑"、"北苑" |
| `detail_address` | varchar(255) | NOT NULL | String | ✅ | 详细地址说明 | 例："东区食堂南侧100米" |
| `longitude` | decimal(10,6) | NOT NULL | BigDecimal | ✅ | 高德地图经度 | 精度：小数点后6位 |
| `latitude` | decimal(10,6) | NOT NULL | BigDecimal | ✅ | 高德地图纬度 | 精度：小数点后6位 |
| `amap_poi_id` | varchar(64) | NULL | String | ❌ | 高德POI ID（预留扩展） | |
| `contact_name` | varchar(64) | NULL | String | ❌ | 站点联系人姓名 | |
| `contact_phone` | varchar(32) | NULL | String | ❌ | 站点联系电话 | |
| `service_time` | varchar(64) | NULL | String | ❌ | 营业时间 | 例："08:00-20:00" |
| `sort_order` | int | DEFAULT 0 | Integer | ✅ | 显示排序 | 越小越靠前（升序） |
| `enabled` | tinyint | DEFAULT 1 | Integer | ✅ | 是否启用 | **1**=启用；**0**=停用（前端不显示） |
| `description` | varchar(500) | NULL | String | ❌ | 补充说明 | 例："支持顺丰、中通、圆通、韵达" |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

---

### 3.6 appeal_info - 申诉/投诉信息表

**表注释**：订单完成后，发单人可投诉代取员；代取员可针对评价发起申诉（两者通过 appeal_type 区分）。  
**对应实体**：[Appeal.java](backend/src/main/java/com/campus/expresshelper/domain/entity/Appeal.java)  
**对应服务**：[AppealService.java](backend/src/main/java/com/campus/expresshelper/service/AppealService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 申诉/投诉ID | |
| `order_id` | bigint | NOT NULL | Long | ✅ | 关联订单ID | FK → `order_info.id`；订单状态必须=COMPLETED或APPEALING |
| `initiator_id` | bigint | NOT NULL | Long | ✅ | 发起人用户ID | FK → `user_info.id` |
| `appeal_type` | varchar(32) | NOT NULL | String | ✅ | 类型 | **COMPLAINT**=投诉(仅发单人)；**APPEAL**=申诉(仅代取员，针对评价) |
| `description` | varchar(500) | NOT NULL | String | ✅ | 详细描述内容 | 长度 ≤ 500字 |
| `evidence_urls` | varchar(1000) | NULL | String | ❌ | 证据图片URL列表 | 建议格式：半角逗号分隔的多URL |
| `status` | varchar(32) | NOT NULL | String | ✅ | 处理状态 | **PENDING**=待处理；**RESOLVED**=已处理（其他状态代码不校验，管理员resolve直接写入传入值） |
| `result` | varchar(500) | NULL | String | ❌ | 处理结果说明 | 管理员resolve时填写 |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

**业务校验**（AppealService.validateAppealType）：
- COMPLAINT：必须是订单发单人（`initiator_id == publisher_id`）
- APPEAL：必须是订单代取员（`initiator_id == courier_id`）
- 同一 (order_id, initiator_id, appeal_type) 组合不可重复提交

**联动**：首次提交成功后 order_info.status = APPEALING；当同一订单所有 PENDING 申诉处理完毕后，若仍为 APPEALING 则自动回写 COMPLETED。

---

### 3.7 credit_record - 信用/积分变动记录表

**表注释**：用户信用分或绿色积分的每一次变动流水，用于审计和"信用记录"页展示。  
**对应实体**：[CreditRecord.java](backend/src/main/java/com/campus/expresshelper/domain/entity/CreditRecord.java)  
**对应服务**：[CreditService.java](backend/src/main/java/com/campus/expresshelper/service/CreditService.java)、[CreditRuleService.java](backend/src/main/java/com/campus/expresshelper/service/CreditRuleService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 记录ID | |
| `user_id` | bigint | NOT NULL | Long | ✅ | 关联用户ID | FK → `user_info.id`；加分/扣分对象 |
| `score_change` | int | NOT NULL | Integer | ✅ | 分值变动（带正负号） | 正数=加分，负数=扣分；信用分最终0-100夹逼 |
| `type` | varchar(32) | NOT NULL | String | ✅ | 积分类型 | **CREDIT**=信用积分；**GREEN**=绿色积分 |
| `reason` | varchar(255) | NOT NULL | String | ✅ | 变动原因说明 | 例："订单完成加分"、"超时扣分"、"实名认证通过加分"、"订单评价加分" |
| `related_order_id` | bigint | NULL | Long | ❌ | 关联订单ID（若与订单相关） | FK → `order_info.id`；与订单无关时=NULL（如认证通过） |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

**加分规则来源**：所有规则分值存放在 system_config（key形如 `CREDIT_RULE_*`），通过 CreditRuleService.rule(key, defaultValue) 读取，缺省使用硬编码默认值：

| system_config.key | 触发场景 | 默认分值 |
|-------------------|---------|---------|
| `CREDIT_RULE_AUTH_PASS` | 实名认证通过 | +5 |
| `CREDIT_RULE_ORDER_COMPLETE` | 订单完成（代取员） | +2 |
| `CREDIT_RULE_TIMEOUT` | 代取员接单超时 | -10 |
| `CREDIT_RULE_REVIEW_POSITIVE` | 订单好评（代取员） | +2 |

---

### 3.8 notice_info - 消息通知表

**表注释**：系统发给用户的所有站内通知消息（订单/认证/申诉/反馈等事件驱动生成）。  
**对应实体**：[NoticeInfo.java](backend/src/main/java/com/campus/expresshelper/domain/entity/NoticeInfo.java)  
**对应服务**：[NoticeService.java](backend/src/main/java/com/campus/expresshelper/service/NoticeService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 消息ID | |
| `user_id` | bigint | NOT NULL | Long | ✅ | 接收用户ID | FK → `user_info.id`；每个用户独立消息栈 |
| `notice_type` | varchar(32) | NOT NULL | String | ✅ | 消息类型（用于前端图标/分类展示） | **ORDER**=订单；**AUTH**=实名认证；**APPEAL**=申诉；**FEEDBACK**=反馈；**REVIEW**=评价 |
| `title` | varchar(128) | NOT NULL | String | ✅ | 消息标题 | 例："订单已被抢"、"实名认证通过" |
| `content` | varchar(1000) | NOT NULL | String | ✅ | 消息正文内容 | 长度 ≤ 1000字 |
| `read_flag` | tinyint | DEFAULT 0 | Integer | ✅ | 已读标记 | **0**=未读；**1**=已读；未读计数小程序 Tabbar 徽标展示 |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记（deleteOne=物理删除，此处保留兼容） | |

---

### 3.9 feedback_info - 帮助与反馈表

**表注释**：小程序用户提交的BUG/建议/账号问题/其他反馈，管理员处理并回复。  
**对应实体**：[Feedback.java](backend/src/main/java/com/campus/expresshelper/domain/entity/Feedback.java)  
**对应服务**：[FeedbackService.java](backend/src/main/java/com/campus/expresshelper/service/FeedbackService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 反馈ID | |
| `user_id` | bigint | NOT NULL | Long | ✅ | 提交用户ID | FK → `user_info.id`；索引 idx_feedback_user_id |
| `feedback_type` | varchar(32) | NOT NULL | String | ✅ | 反馈类型（白名单校验） | **BUG**=程序错误；**SUGGESTION**=功能建议；**ACCOUNT**=账号问题；**OTHER**=其他 |
| `content` | varchar(500) | NOT NULL | String | ✅ | 反馈内容 | 长度 1-500字 |
| `status` | varchar(32) | DEFAULT 'PENDING' | String | ✅ | 处理状态 | 索引 idx_feedback_status；**PENDING**=待处理；**PROCESSED**=已处理 |
| `reply` | varchar(500) | NULL | String | ❌ | 管理员回复内容 | 长度 1-500字；resolve时必填 |
| `handled_by` | bigint | NULL | Long | ❌ | 处理人管理员ID | 预留（当前管理员固定 userId=0） |
| `handled_at` | datetime | NULL | LocalDateTime | ❌ | 处理时间 | resolve时=LocalDateTime.now() |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

---

### 3.10 system_config - 系统配置表

**表注释**：可热更新的系统参数配置（当前主要用于信用积分规则、运营开关等）。  
**对应实体**：[SystemConfig.java](backend/src/main/java/com/campus/expresshelper/domain/entity/SystemConfig.java)  
**对应服务**：[SystemConfigService.java](backend/src/main/java/com/campus/expresshelper/service/SystemConfigService.java)

| 字段名 | SQL类型 | 约束/默认 | Java类型 | 必填 | 业务说明 | 取值/枚举 |
|--------|---------|----------|---------|------|---------|----------|
| `id` | bigint | PK, AUTO_INCREMENT | Long | ✅ | 配置ID | |
| `config_key` | varchar(64) | NOT NULL, UNIQUE | String | ✅ | 配置键（唯一） | 命名惯例：`大分类_小项`；例：`CREDIT_RULE_ORDER_COMPLETE` |
| `config_value` | text | NOT NULL | String | ✅ | 配置值 | 数值/JSON/字符串均可；读取方自行解析（Integer用Integer.parseInt） |
| `config_desc` | varchar(255) | NULL | String | ❌ | 配置项说明 | 便于后台列表理解 |
| `enabled` | tinyint | DEFAULT 1 | Integer | ✅ | 是否启用 | **1**=生效读取；**0**=读取时按null处理（需调用方校验） |
| `created_at` | datetime | NULL | LocalDateTime | 自动 | 创建时间 | |
| `updated_at` | datetime | NULL | LocalDateTime | 自动 | 更新时间 | |
| `deleted` | tinyint | DEFAULT 0 | Integer | 自动 | 逻辑删除标记 | |

---

## 4. 通用字段说明（所有表共有）

所有10张表均继承以下3个字段（来源：[BaseEntity.java](backend/src/main/java/com/campus/expresshelper/domain/entity/BaseEntity.java)，由 MyBatis-Plus 自动填充）：

| 字段名 | SQL类型 | 默认值 | 填充策略 | 说明 |
|--------|---------|-------|---------|------|
| `created_at` | datetime | NULL | INSERT 时自动（FieldFill.INSERT） | 记录首次插入时间。对应配置见 [MybatisMetaObjectHandler.java](backend/src/main/java/com/campus/expresshelper/config/MybatisMetaObjectHandler.java) |
| `updated_at` | datetime | NULL | INSERT + UPDATE 时自动（FieldFill.INSERT_UPDATE） | 记录最后修改时间 |
| `deleted` | tinyint | 0 | 默认 | **逻辑删除标记**：0=有效，1=已删除。⚠️ 当前 [application.yml](backend/src/main/resources/application.yml#L21-L26) 中已注释掉全局逻辑删除配置，因此目前 deleted 字段仅作为标记存储，**不会**被 MP 自动过滤，若要启用需恢复yml中配置。 |

---

## 5. 表间关联关系与业务流程

### 5.1 ER 关系（逻辑关联，项目未建立物理外键约束）

```
user_info (1) ────────< (N) order_info [publisher_id]
user_info (1) ────────< (N) order_info [courier_id]
user_info (1) ────────< (N) real_name_auth [user_id]
user_info (1) ────────< (N) credit_record [user_id]
user_info (1) ────────< (N) notice_info [user_id]
user_info (1) ────────< (N) feedback_info [user_id]
user_info (1) ────────< (N) appeal_info [initiator_id]
user_info (1) ────────< (N) order_review [reviewer_id]
user_info (1) ────────< (N) order_review [reviewee_id]

order_info (1) ───────< (N) order_review [order_id]   唯一约束(order_id, reviewer_id)
order_info (1) ───────< (N) appeal_info [order_id]
order_info (1) ───────< (N) credit_record [related_order_id]  (可选)

express_station_info (1) ── 逻辑名称关联 ──> order_info [station_name]

system_config (独立表，无外键，通过 key 读取)
```

### 5.2 关键业务流程对应到表的写入链

| 业务场景 | 写表顺序 | 关键服务方法 |
|---------|---------|------------|
| 新用户注册 | user_info（credit=60, auth=0, courier=0） | [UserService.register()](backend/src/main/java/com/campus/expresshelper/service/UserService.java#L26-L59) |
| 提交实名认证 | real_name_auth (PENDING) → notice_info (AUTH) | [AuthService.submit()](backend/src/main/java/com/campus/expresshelper/service/AuthService.java#L33-L56) |
| 管理员审核通过认证 | real_name_auth (APPROVED) → user_info (auth=1, courier=1, username=realname) → credit_record (+5 CREDIT) → notice_info | [AuthService.approve()](backend/src/main/java/com/campus/expresshelper/service/AuthService.java#L58-L76) |
| 发布订单 | order_info (PENDING_GRAB, version=0, expireAt) + Redis ZSet → notice_info | [OrderService.createOrder()](backend/src/main/java/com/campus/expresshelper/service/OrderService.java#L48-L71) |
| 抢单成功 | order_info (courier_id, GRABBED, version+1，乐观锁) → notice_info × 2 | [OrderService.grabOrder()](backend/src/main/java/com/campus/expresshelper/service/OrderService.java#L99-L136) |
| 订单完成(人工/自动) | order_info (COMPLETED, delivery_completed_at) → credit_record (+2 CREDIT) → order_review (5星，系统评论) → credit_record (+2 REVIEW + GREEN) → notice_info × N | [OrderService.updateStatus()](backend/src/main/java/com/campus/expresshelper/service/OrderService.java#L138-L185) + [handleAutoConfirm()](backend/src/main/java/com/campus/expresshelper/service/OrderService.java#L247-L278) |
| 提交申诉/投诉 | appeal_info (PENDING) → order_info (APPEALING) → notice_info | [AppealService.submit()](backend/src/main/java/com/campus/expresshelper/service/AppealService.java#L26-L60) |
| 处理反馈 | feedback_info (PROCESSED, reply, handledBy, handledAt) → notice_info | [FeedbackService.resolve()](backend/src/main/java/com/campus/expresshelper/service/FeedbackService.java#L77-L98) |

---

## 6. 枚举值汇总速查表

### 6.1 order_info.status - 订单状态 (7项)
`PENDING_GRAB` 待抢单 / `GRABBED` 已抢单 / `PICKED_UP` 已取件 / `DELIVERING` 配送中 / `COMPLETED` 已完成 / `CANCELLED` 已取消 / `APPEALING` 申诉中

### 6.2 order_info.cancel_type - 取消类型 (2项)
`USER_CANCEL` 用户主动取消 / `ADMIN_CANCEL` 管理员强制取消

### 6.3 real_name_auth.status - 认证状态 (3项)
`PENDING` 待审核 / `APPROVED` 已通过 / `REJECTED` 已驳回

### 6.4 appeal_info.appeal_type - 申诉类型 (2项)
`COMPLAINT` 发单人投诉代取员 / `APPEAL` 代取员申诉评价

### 6.5 appeal_info.status - 申诉处理状态 (至少2项)
`PENDING` 待处理 / `RESOLVED` 已处理（管理员resolve参数直接写入，可扩展）

### 6.6 credit_record.type - 积分类型 (2项)
`CREDIT` 信用积分（0-100） / `GREEN` 绿色积分（无上限）

### 6.7 notice_info.notice_type - 通知类型 (至少4项)
`ORDER` 订单 / `AUTH` 实名认证 / `APPEAL` 申诉 / `FEEDBACK` 反馈 / `REVIEW` 评价

### 6.8 feedback_info.feedback_type - 反馈类型 (4项，白名单校验)
`BUG` 程序错误 / `SUGGESTION` 功能建议 / `ACCOUNT` 账号问题 / `OTHER` 其他

### 6.9 feedback_info.status - 反馈状态 (2项)
`PENDING` 待处理 / `PROCESSED` 已处理

### 6.10 标志位 (tinyint 0/1 类通用)
| 字段 | 0 | 1 |
|------|---|---|
| user_info.auth_status | 未认证 | 已认证 |
| user_info.courier_enabled | 禁用代取 | 可代取 |
| user_info.freeze_status | 账号正常 | 账号冻结 |
| order_info.allow_bargain | 一口价 | 允许议价 |
| order_info.has_review | 未评价 | 已评价 |
| order_info.republished | 未重发 | 已重发(限1次) |
| notice_info.read_flag | 未读 | 已读 |
| express_station_info.enabled | 停用 | 启用 |
| system_config.enabled | 配置禁用 | 配置启用 |
| 通用 deleted | 未删除 | 已删除(标记) |

---

## 附录 A：数据库连接配置参考

来源：[application.yml](backend/src/main/resources/application.yml)

```yaml
datasource:
  url: jdbc:mysql://localhost:3306/express_helper?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
  username: Zhang
  password: 123456
redis:
  host: localhost:6379 / database=0
jwt:
  secret: campus-express-helper-jwt-secret-key-2026
  admin-username: admin / admin-password: admin123
upload:
  path: ./uploads （挂载 URL=/uploads/**，见 WebConfig/WebMvcConfig）
```

## 附录 B：索引与优化建议

基于代码中大量使用的查询条件，建议补充以下索引（当前SQL中未建）：

| 表 | 建议索引 | 用途场景 |
|----|---------|---------|
| order_info | idx_status_created(status, created_at) | 抢单大厅分页查询、仪表盘各状态计数 |
| order_info | idx_publisher(publisher_id, created_at) | myPublishedOrders 我的发布 |
| order_info | idx_courier(courier_id, created_at) | myGrabbedOrders 我的接单 |
| real_name_auth | idx_user_created(user_id, created_at) | AuthService.latestByUser（按用户取最新一条） |
| appeal_info | idx_order_initiator_status(order_id, initiator_id, appeal_type, status) | 重复提交校验、pending计数 |
| credit_record | idx_user_created(user_id, created_at) | listUserCredits 信用记录分页 |
| notice_info | idx_user_read_created(user_id, read_flag, created_at) | unreadCount 计数、userNotices 列表 |

---

*数据字典结束*
