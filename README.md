# 请假申请系统 (Leave Application System)

一个为中小型企业设计的员工请假申请与管理系统，支持多级审批流程、统一余额管理和日历视图。

## 功能特性

### 核心功能
- **用户认证** - JWT Token登录认证
- **角色权限** - 系统管理员、HR、员工三种角色
- **请假申请** - 支持8种请假类型（年假、病假、婚假、产假、陪产假、恩恤假、无薪假、其他）
- **统一余额** - 所有假期类型共用统一余额池
- **多级审批** - PM背书 + HR审批双级流程
- **请假日历** - 直观展示团队请假安排
- **个人资料** - 查看和修改个人信息、密码

### 技术栈

#### 前端
- React 18 + TypeScript
- Vite构建工具
- Ant Design 5 UI组件库
- Zustand状态管理
- React Router路由管理
- Axios HTTP客户端
- Dayjs日期处理

#### 后端
- Node.js + Express
- JavaScript (ES Module)
- JWT认证
- RESTful API设计

## 项目结构

```
leave-system/
├── frontend/          # 前端React应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Login/           # 登录页
│   │   │   ├── Dashboard/       # 仪表板
│   │   │   ├── LeaveApply/      # 申请请假
│   │   │   ├── MyApplications/  # 我的申请
│   │   │   ├── PendingApproval/ # 待我审批
│   │   │   ├── Calendar/        # 请假日历
│   │   │   ├── Users/           # 用户管理
│   │   │   └── Profile/         # 个人资料
│   │   ├── router/        # 路由配置
│   │   ├── store/         # 状态管理
│   │   ├── types/         # TypeScript类型定义
│   │   └── mock/          # Mock数据
│   ├── package.json
│   └── vite.config.ts
│
├── backend/           # 后端Node.js服务
│   ├── src/
│   │   ├── routes/        # API路由
│   │   │   ├── auth.js          # 认证接口
│   │   │   ├── users.js         # 用户接口
│   │   │   ├── leaveApplications.js  # 请假申请接口
│   │   │   ├── balances.js      # 余额接口
│   │   │   └── calendar.js      # 日历接口
│   │   └── mock/          # Mock数据
│   ├── package.json
│   └── .npmrc
│
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 启动开发服务器

```bash
# 启动后端（端口3001）
cd backend
npm run dev

# 新终端 - 启动前端（端口5173）
cd frontend
npm run dev
```

### 访问应用

- 前端地址: http://localhost:5173
- 后端API: http://localhost:3001/api/v1

## 默认账号

| 用户名 | 密码 | 角色 |
|-------|------|------|
| admin | password123 | 系统管理员 |
| wenny | password123 | HR |
| alex | password123 | 员工 |
| lisa | password123 | 员工 |
| tom | password123 | 员工 |

## 主要功能模块

### 1. 仪表板
- 统计卡片（待审批数、本月请假天数、剩余假期、团队成员）
- 快捷操作按钮（申请请假、查看日历、我的申请）
- 待办审批列表
- 系统公告

### 2. 请假管理
- **申请请假** - 选择请假类型、填写时间段、上传证明材料
- **我的申请** - 查看历史申请记录、筛选状态、取消申请
- **待我审批** - PM/HR审批界面、通过/拒绝操作

### 3. 请假日历
- 月历视图展示团队请假情况
- 按请假类型筛选
- 点击日期查看当日请假详情

### 4. 用户管理 (HR/Admin权限)
- 用户列表查询
- 新增/编辑/删除用户
- 角色分配

### 5. 个人资料
- 查看基本信息
- 修改个人资料
- 修改密码
- 查看假期余额
- 查看最近活动

## 请假类型说明

| 类型 | 代码 | 需要证明 | 说明 |
|-----|------|---------|------|
| 年假 | annual | 否 | 带薪年休假 |
| 病假 | sick | 是 | 需提供医疗证明 |
| 婚假 | marriage | 是 | 需提供结婚证明 |
| 产假 | maternity | 是 | 需提供医院证明 |
| 陪产假 | paternity | 是 | 需提供出生证明 |
| 恩恤假 | compassionate | 否 | 直系亲属丧假 |
| 无薪假 | unpaid | 否 | 不带薪休假 |
| 其他 | other | 否 | 特殊情况 |

## 业务流程

### 标准请假流程
```
员工提交申请 → 系统检查余额 → 通知PM背书 → PM背书通过 → 通知HR审批 → HR审批通过 → 扣除余额 → 完成
```

### 余额计算规则
- 所有请假类型共用统一余额池
- 总额度由HR初始化设置（默认20天）
- 每次请假扣除相应天数
- 取消已批准申请返还余额

## API文档

### 认证接口
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出

### 用户接口
- `GET /api/v1/users` - 获取用户列表
- `POST /api/v1/users` - 创建用户
- `PUT /api/v1/users/:id` - 更新用户
- `DELETE /api/v1/users/:id` - 删除用户

### 请假申请接口
- `GET /api/v1/leave-applications` - 获取申请列表
- `POST /api/v1/leave-applications` - 提交申请
- `POST /api/v1/leave-applications/:id/cancel` - 取消申请
- `POST /api/v1/leave-applications/:id/endorse` - PM背书
- `POST /api/v1/leave-applications/:id/hr-approve` - HR审批

### 余额接口
- `GET /api/v1/balances` - 查询余额
- `POST /api/v1/balances/adjust` - 调整余额

### 日历接口
- `GET /api/v1/calendar/events` - 获取日历事件

## 开发计划

### MVP1 (已完成)
- [x] 基础认证与授权
- [x] 用户管理
- [x] 请假申请流程（8种类型）
- [x] 统一余额管理
- [x] 多级审批流程
- [x] 请假日历
- [x] 个人资料

### MVP2 (计划中)
- [ ] 移动端适配优化
- [ ] 高级日历筛选
- [ ] 资源管理看板
- [ ] 自动邮件提醒
- [ ] Excel导入导出
- [ ] 系统设置模块

### MVP3 (未来规划)
- [ ] 工作流自定义
- [ ] 多语言支持
- [ ] 企业AD集成
- [ ] 数据分析报表
- [ ] 移动端App

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提交Issue。
