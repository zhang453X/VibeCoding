<template>
  <!-- 登录页面 -->
  <div v-if="!isLogin" class="login-container">
    <div class="login-content">
      <h1 class="login-title">校园快递代取</h1>
      <div class="login-tab">
        <span class="active-tab">账号密码登录</span>
        <div class="tab-underline"></div>
      </div>
      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="账户：admin"
            size="large"
            :prefix-icon="User"
            clearable
            class="login-input"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            placeholder="密码"
            size="large"
            type="password"
            :prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="doLogin"
            class="login-input"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="doLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>

  <!-- 管理后台 -->
  <div v-else class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside class="sidebar" :width="isCollapse ? '64px' : '220px'">
      <div class="sidebar-header">
        <el-icon :size="32" color="#fff" v-if="!isCollapse"><Setting /></el-icon>
        <el-icon :size="24" color="#fff" v-else><Setting /></el-icon>
        <span class="sidebar-title" v-if="!isCollapse">校园快递代取</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        @select="handleMenuSelect"
      >
        <el-menu-item index="dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>数据概览</template>
        </el-menu-item>
        <el-menu-item index="users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        <el-menu-item index="auth">
          <el-icon><Stamp /></el-icon>
          <template #title>实名认证</template>
        </el-menu-item>
        <el-menu-item index="orders">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item index="stations">
          <el-icon><Location /></el-icon>
          <template #title>快递点管理</template>
        </el-menu-item>
        <el-menu-item index="appeals">
          <el-icon><Bell /></el-icon>
          <template #title>申诉处理</template>
        </el-menu-item>
        <el-menu-item index="feedbacks">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>反馈处理</template>
        </el-menu-item>
        <el-menu-item index="configs">
          <el-icon><Tools /></el-icon>
          <template #title>系统参数</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container" :class="{ collapsed: isCollapse }">
      <!-- 顶部栏 -->
      <el-header class="top-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-button type="primary" :icon="Refresh" @click="loadAll" :loading="loading">
            刷新数据
          </el-button>
          <el-button type="danger" :icon="SwitchButton" @click="logout">
            退出登录
          </el-button>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <!-- 数据概览页面 -->
        <div v-if="activeMenu === 'dashboard'" class="dashboard-page">
          <h2 class="page-title">数据概览</h2>
          
          <!-- 数据卡片 -->
          <el-row :gutter="16" class="dashboard-cards">
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-icon blue"><el-icon :size="28"><Document /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ dashboard.totalOrders || 0 }}</div>
                  <div class="stat-label">总订单</div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-icon green"><el-icon :size="28"><CircleCheck /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ dashboard.completedOrders || 0 }}</div>
                  <div class="stat-label">已完成</div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-icon orange"><el-icon :size="28"><Timer /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ dashboard.pendingGrabOrders || 0 }}</div>
                  <div class="stat-label">待抢单</div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :md="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-icon red"><el-icon :size="28"><Warning /></el-icon></div>
                <div class="stat-content">
                  <div class="stat-value">{{ dashboard.cancelledOrders || 0 }}</div>
                  <div class="stat-label">已取消</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 订单统计可视化 -->
          <el-row :gutter="16" class="visualization-row">
            <el-col :xs="24" :md="12">
              <el-card class="visualization-card" shadow="hover">
                <div class="visualization-title">订单统计</div>
                <div class="order-status-chart">
                  <div class="status-bar">
                    <div class="status-label">
                      <span class="status-dot green"></span>
                      <span>已完成</span>
                    </div>
                    <div class="status-progress">
                      <el-progress :percentage="orderStatusPercentages.completed" :color="'#67c23a'" :stroke-width="20" />
                    </div>
                    <div class="status-value">{{ dashboard.completedOrders || 0 }}</div>
                  </div>
                  <div class="status-bar">
                    <div class="status-label">
                      <span class="status-dot orange"></span>
                      <span>待抢单</span>
                    </div>
                    <div class="status-progress">
                      <el-progress :percentage="orderStatusPercentages.pendingGrab" :color="'#e6a23c'" :stroke-width="20" />
                    </div>
                    <div class="status-value">{{ dashboard.pendingGrabOrders || 0 }}</div>
                  </div>
                  <div class="status-bar">
                    <div class="status-label">
                      <span class="status-dot purple"></span>
                      <span>待取件</span>
                    </div>
                    <div class="status-progress">
                      <el-progress :percentage="orderStatusPercentages.toPickup" :color="'#8b5cf6'" :stroke-width="20" />
                    </div>
                    <div class="status-value">{{ dashboard.toPickupOrders || 0 }}</div>
                  </div>
                  <div class="status-bar">
                    <div class="status-label">
                      <span class="status-dot cyan"></span>
                      <span>配送中</span>
                    </div>
                    <div class="status-progress">
                      <el-progress :percentage="orderStatusPercentages.delivering" :color="'#06b6d4'" :stroke-width="20" />
                    </div>
                    <div class="status-value">{{ dashboard.deliveringOrders || 0 }}</div>
                  </div>
                  <div class="status-bar">
                    <div class="status-label">
                      <span class="status-dot danger"></span>
                      <span>申诉中</span>
                    </div>
                    <div class="status-progress">
                      <el-progress :percentage="orderStatusPercentages.appealing" :color="'#f56c6c'" :stroke-width="20" />
                    </div>
                    <div class="status-value">{{ dashboard.appealingOrders || 0 }}</div>
                  </div>
                  <div class="status-bar">
                    <div class="status-label">
                      <span class="status-dot info"></span>
                      <span>已取消</span>
                    </div>
                    <div class="status-progress">
                      <el-progress :percentage="orderStatusPercentages.cancelled" :color="'#909399'" :stroke-width="20" />
                    </div>
                    <div class="status-value">{{ dashboard.cancelledOrders || 0 }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card class="visualization-card" shadow="hover">
                <div class="visualization-title">订单完成率</div>
                <div class="completion-visual">
                  <div class="completion-ring">
                    <el-progress
                      type="circle"
                      :percentage="completionRate"
                      :color="completionColor"
                      :stroke-width="12"
                      :width="180"
                    />
                  </div>
                  <div class="completion-details">
                    <div class="completion-detail-item">
                      <span class="detail-label">总订单</span>
                      <span class="detail-value">{{ dashboard.totalOrders || 0 }}</span>
                    </div>
                    <div class="completion-detail-item">
                      <span class="detail-label">已完成</span>
                      <span class="detail-value green">{{ dashboard.completedOrders || 0 }}</span>
                    </div>
                    <div class="completion-detail-item">
                      <span class="detail-label">完成率</span>
                      <span class="detail-value" :style="{ color: completionColor }">{{ completionRate }}%</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 用户统计和申诉统计可视化 -->
          <el-row :gutter="16" class="quick-stats">
            <el-col :xs="24" :md="12">
              <el-card class="quick-stat-card" shadow="hover">
                <div class="quick-stat-header">
                  <span class="quick-stat-title">用户统计</span>
                </div>
                <div class="user-stats-visual">
                  <div class="user-stat-item">
                    <div class="user-stat-info">
                      <span class="user-stat-label">总用户数</span>
                      <span class="user-stat-value">{{ userTotal }}</span>
                    </div>
                    <el-progress
                      :percentage="100"
                      :color="'#409eff'"
                      :stroke-width="16"
                      :show-text="false"
                    />
                  </div>
                  <div class="user-stat-item">
                    <div class="user-stat-info">
                      <span class="user-stat-label">已实名认证</span>
                      <span class="user-stat-value">{{ authTotal }}</span>
                    </div>
                    <el-progress
                      :percentage="authPercentage"
                      :color="'#67c23a'"
                      :stroke-width="16"
                      :show-text="false"
                    />
                  </div>
                  <div class="user-stat-summary">
                    <el-tag type="success" size="large">
                      认证率: {{ authPercentage }}%
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :md="12">
              <el-card class="quick-stat-card" shadow="hover">
                <div class="quick-stat-header">
                  <span class="quick-stat-title">申诉统计</span>
                </div>
                <div class="appeal-stats-visual">
                  <div class="appeal-stat-item">
                    <div class="appeal-stat-info">
                      <span class="appeal-stat-label">总申诉数</span>
                      <span class="appeal-stat-value">{{ appealTotal }}</span>
                    </div>
                    <el-progress
                      :percentage="100"
                      :color="'#409eff'"
                      :stroke-width="16"
                      :show-text="false"
                    />
                  </div>
                  <div class="appeal-stat-item">
                    <div class="appeal-stat-info">
                      <span class="appeal-stat-label">待处理申诉</span>
                      <span class="appeal-stat-value warning">{{ pendingAppealsCount }}</span>
                    </div>
                    <el-progress
                      :percentage="appealPendingPercentage"
                      :color="'#e6a23c'"
                      :stroke-width="16"
                      :show-text="false"
                    />
                  </div>
                  <div class="appeal-stat-item">
                    <div class="appeal-stat-info">
                      <span class="appeal-stat-label">已处理申诉</span>
                      <span class="appeal-stat-value success">{{ appealTotal - pendingAppealsCount }}</span>
                    </div>
                    <el-progress
                      :percentage="appealResolvedPercentage"
                      :color="'#67c23a'"
                      :stroke-width="16"
                      :show-text="false"
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 用户管理页面 -->
        <div v-else-if="activeMenu === 'users'" class="page-container">
          <h2 class="page-title">用户管理</h2>
          <div class="table-toolbar">
            <el-input
              v-model="userSearch"
              placeholder="搜索学号或昵称"
              clearable
              style="width: 240px"
              :prefix-icon="Search"
            />
            <el-tag type="info">共 {{ userTotal }} 位用户</el-tag>
          </div>
          <el-table :data="filteredUsers" v-loading="loading" stripe border>
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="nickname" label="昵称" width="120" />
            <el-table-column prop="phone" label="手机号" width="130">
              <template #default="scope">
                {{ maskPhone(scope.row.phone) }}
              </template>
            </el-table-column>
            <el-table-column prop="creditScore" label="信用分" width="90" align="center">
              <template #default="scope">
                <el-tag :type="getCreditTagType(scope.row.creditScore)">
                  {{ scope.row.creditScore }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="greenScore" label="环保分" width="90" align="center">
              <template #default="scope">
                <el-tag type="success">{{ scope.row.greenScore || 0 }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="认证状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.authStatus === 1 ? 'success' : 'info'">
                  {{ scope.row.authStatus === 1 ? '已认证' : '未认证' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="代取员" width="90" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.courierEnabled === 1 ? 'success' : 'info'">
                  {{ scope.row.courierEnabled === 1 ? '已启用' : '未启用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.freezeStatus === 1 ? 'danger' : 'success'">
                  {{ scope.row.freezeStatus === 1 ? '已冻结' : '正常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="注册时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="420" fixed="right">
              <template #default="scope">
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <el-button
                    size="small"
                    type="primary"
                    :icon="Edit"
                    @click="editUser(scope.row)"
                  >编辑</el-button>
                  <el-button
                    size="small"
                    type="info"
                    :icon="Lock"
                    @click="resetPassword(scope.row.id)"
                  >重置密码</el-button>
                  <el-button
                    v-if="scope.row.courierEnabled !== 1"
                    size="small"
                    type="success"
                    :icon="Check"
                    @click="toggleCourierEnabled(scope.row.id, 1)"
                  >启用代取</el-button>
                  <el-button
                    v-else
                    size="small"
                    type="warning"
                    :icon="Close"
                    @click="toggleCourierEnabled(scope.row.id, 0)"
                  >禁用代取</el-button>
                  <el-button
                    v-if="scope.row.freezeStatus !== 1"
                    size="small"
                    type="danger"
                    :icon="Lock"
                    @click="changeFreeze(scope.row.id, 1)"
                  >冻结</el-button>
                  <el-button
                    v-else
                    size="small"
                    type="success"
                    :icon="Unlock"
                    @click="changeFreeze(scope.row.id, 0)"
                  >解冻</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleUserPageSizeChange"
              @current-change="handleUserPageChange"
              :current-page="userPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="userPageSize"
              :total="userTotal"
              layout="prev, pager, next, jumper"
            />
          </div>
        </div>

        <!-- 实名认证审核页面 -->
        <div v-else-if="activeMenu === 'auth'" class="page-container">
          <h2 class="page-title">实名认证审核</h2>
          <div class="table-toolbar">
            <el-select v-model="authStatusFilter" placeholder="筛选状态" clearable style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="PENDING" />
              <el-option label="已通过" value="APPROVED" />
              <el-option label="已驳回" value="REJECTED" />
            </el-select>
            <el-tag type="info">共 {{ authTotal }} 条记录</el-tag>
          </div>
          <el-empty v-if="filteredAuthList.length === 0" description="暂无实名认证记录" />
          <el-table v-else :data="filteredAuthList" v-loading="loading" stripe border>
            <el-table-column prop="id" label="记录ID" width="90" align="center" />
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="realName" label="真实姓名" width="100" />
            <el-table-column label="身份证正面" width="120" align="center">
              <template #default="scope">
                <el-image
                  v-if="scope.row.idCardFrontUrl"
                  :src="scope.row.idCardFrontUrl"
                  style="width: 60px; height: 40px"
                  fit="cover"
                  :preview-src-list="[scope.row.idCardFrontUrl]"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="身份证反面" width="120" align="center">
              <template #default="scope">
                <el-image
                  v-if="scope.row.idCardBackUrl"
                  :src="scope.row.idCardBackUrl"
                  style="width: 60px; height: 40px"
                  fit="cover"
                  :preview-src-list="[scope.row.idCardBackUrl]"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="身份证+校园卡合拍" width="150" align="center">
              <template #default="scope">
                <el-image
                  v-if="scope.row.idCardWithStudentCardUrl"
                  :src="scope.row.idCardWithStudentCardUrl"
                  style="width: 60px; height: 40px"
                  fit="cover"
                  :preview-src-list="[scope.row.idCardWithStudentCardUrl]"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="scope">
                <el-tag :type="getAuthStatusType(scope.row.status)">{{ getAuthStatusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rejectReason" label="驳回原因" min-width="120" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.rejectReason || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button v-if="scope.row.status === 'PENDING'" type="success" size="small" :icon="Check" @click="approve(scope.row.id)">通过</el-button>
                <el-button v-if="scope.row.status === 'PENDING'" type="danger" size="small" :icon="Close" @click="reject(scope.row.id)">驳回</el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleAuthPageSizeChange"
              @current-change="handleAuthPageChange"
              :current-page="authPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="authPageSize"
              :total="authTotal"
              layout="prev, pager, next, jumper"
            />
          </div>
        </div>

        <!-- 订单管理页面 -->
        <div v-else-if="activeMenu === 'orders'" class="page-container">
          <h2 class="page-title">订单管理</h2>
          <div class="table-toolbar">
            <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="待抢单" value="PENDING_GRAB">
                <el-tag type="warning" size="small">待抢单</el-tag>
              </el-option>
              <el-option label="已抢单" value="GRABBED">
                <el-tag type="primary" size="small">已抢单</el-tag>
              </el-option>
              <el-option label="已完成" value="COMPLETED">
                <el-tag type="success" size="small">已完成</el-tag>
              </el-option>
              <el-option label="已取消" value="CANCELLED">
                <el-tag type="info" size="small">已取消</el-tag>
              </el-option>
            </el-select>
            <el-button type="primary" :icon="Search" @click="loadOrders">筛选</el-button>
            <el-button type="success" :icon="Download" @click="exportOrders">导出订单</el-button>
            <el-tag type="info">共 {{ orderTotal }} 个订单</el-tag>
          </div>
          <el-table :data="orders" v-loading="loading" stripe border>
            <el-table-column prop="id" label="订单ID" width="80" align="center" />
            <el-table-column prop="expressCompany" label="快递公司" width="100" />
            <el-table-column prop="expressNo" label="快递单号" width="140" />
            <el-table-column prop="stationName" label="取件站点" width="130" />
            <el-table-column prop="deliveryLocation" label="送达地点" width="130" />
            <el-table-column prop="fee" label="费用" width="80" align="center">
              <template #default="scope">
                <span class="fee-text">¥{{ scope.row.fee }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getOrderStatusType(scope.row.status)">
                  {{ getOrderStatusText(scope.row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="publisherId" label="发单人ID" width="90" align="center" />
            <el-table-column prop="courierId" label="代取员ID" width="90" align="center">
              <template #default="scope">
                {{ scope.row.courierId || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="pickupTimeRange" label="取件时间" width="120" />
            <el-table-column prop="createdAt" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'PENDING_GRAB'"
                  type="danger"
                  size="small"
                  :icon="CircleClose"
                  @click="cancel(scope.row.id)"
                >取消</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleOrderPageSizeChange"
              @current-change="handleOrderPageChange"
              :current-page="orderPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="orderPageSize"
              :total="orderTotal"
              layout="prev, pager, next, jumper"
            />
          </div>
        </div>

        <!-- 申诉处理页面 -->
        <div v-else-if="activeMenu === 'appeals'" class="page-container">
          <h2 class="page-title">申诉处理</h2>
          <div class="table-toolbar">
            <el-tag type="info">共 {{ appealTotal }} 条记录</el-tag>
            <el-select v-model="appealStatusFilter" placeholder="筛选状态" clearable style="width: 150px">
              <el-option label="待处理" value="PENDING" />
              <el-option label="已通过" value="DONE" />
              <el-option label="已驳回" value="REJECTED" />
            </el-select>
            <el-select v-model="appealTypeFilter" placeholder="筛选类型" clearable style="width: 150px">
              <el-option label="投诉" value="COMPLAINT" />
              <el-option label="申诉" value="APPEAL" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="applyAppealFilters">筛选</el-button>
            <el-button @click="resetAppealFilters">重置</el-button>
          </div>
          <el-empty v-if="appeals.length === 0" description="暂无投诉/申诉记录" />
          <el-table v-else :data="appeals" v-loading="loading" stripe border>
            <el-table-column prop="id" label="申诉ID" width="80" align="center" />
            <el-table-column prop="orderId" label="订单ID" width="80" align="center" />
            <el-table-column prop="initiatorId" label="发起人ID" width="90" align="center" />
            <el-table-column prop="appealType" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getAppealTypeTagType(scope.row.appealType)">
                  {{ getAppealTypeText(scope.row.appealType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="申诉描述" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="90" align="center">
              <template #default="scope">
                <el-tag :type="getAppealStatusType(scope.row.status)">
                  {{ getAppealStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="result" label="处理结果" min-width="150" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.result || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'PENDING'"
                  type="success"
                  size="small"
                  :icon="Check"
                  @click="approveAppeal(scope.row)"
                >同意</el-button>
                <el-button
                  v-if="scope.row.status === 'PENDING'"
                  type="danger"
                  size="small"
                  :icon="Close"
                  @click="rejectAppeal(scope.row)"
                >驳回</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleAppealPageSizeChange"
              @current-change="handleAppealPageChange"
              :current-page="appealPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="appealPageSize"
              :total="appealTotal"
              layout="prev, pager, next, jumper"
            />
          </div>
        </div>

        <div v-else-if="activeMenu === 'feedbacks'" class="page-container">
          <h2 class="page-title">反馈处理</h2>
          <div class="table-toolbar">
            <el-input
              v-model="feedbackUserIdFilter"
              placeholder="筛选用户ID"
              clearable
              style="width: 160px"
            />
            <el-select v-model="feedbackTypeFilter" placeholder="反馈类型" clearable style="width: 150px">
              <el-option label="功能异常" value="BUG" />
              <el-option label="页面建议" value="SUGGESTION" />
              <el-option label="账号问题" value="ACCOUNT" />
              <el-option label="其他反馈" value="OTHER" />
            </el-select>
            <el-select v-model="feedbackStatusFilter" placeholder="处理状态" clearable style="width: 140px">
              <el-option label="待处理" value="PENDING" />
              <el-option label="已处理" value="PROCESSED" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="applyFeedbackFilters">筛选</el-button>
            <el-button @click="resetFeedbackFilters">重置</el-button>
            <el-tag type="info">共 {{ feedbackTotal }} 条反馈</el-tag>
          </div>
          <el-empty v-if="feedbacks.length === 0" description="暂无用户反馈" />
          <el-table v-else :data="feedbacks" v-loading="loading" stripe border>
            <el-table-column prop="id" label="反馈ID" width="90" align="center" />
            <el-table-column prop="userId" label="用户ID" width="90" align="center" />
            <el-table-column label="反馈类型" width="110" align="center">
              <template #default="scope">
                <el-tag :type="getFeedbackTypeTagType(scope.row.feedbackType)">
                  {{ getFeedbackTypeText(scope.row.feedbackType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="反馈内容" min-width="240" show-overflow-tooltip />
            <el-table-column label="状态" width="100" align="center">
              <template #default="scope">
                <el-tag :type="getFeedbackStatusType(scope.row.status)">
                  {{ getFeedbackStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reply" label="处理结果" min-width="220" show-overflow-tooltip>
              <template #default="scope">
                {{ scope.row.reply || "-" }}
              </template>
            </el-table-column>
            <el-table-column prop="handledBy" label="处理人" width="90" align="center">
              <template #default="scope">
                {{ scope.row.handledBy || "-" }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="170">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column prop="handledAt" label="处理时间" width="170">
              <template #default="scope">
                {{ formatDate(scope.row.handledAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'PENDING'"
                  type="primary"
                  size="small"
                  :icon="Check"
                  @click="handleFeedback(scope.row.id)"
                >处理</el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              @size-change="handleFeedbackPageSizeChange"
              @current-change="handleFeedbackPageChange"
              :current-page="feedbackPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="feedbackPageSize"
              :total="feedbackTotal"
              layout="prev, pager, next, jumper"
            />
          </div>
        </div>

        <!-- 快递点管理页面 -->
        <div v-else-if="activeMenu === 'stations'" class="page-container">
          <h2 class="page-title">快递点管理</h2>
          <div class="table-toolbar">
            <el-button type="primary" :icon="Plus" @click="openStationDialog()">新增快递点</el-button>
            <el-tag type="info">快递点地图预览依赖系统参数 `AMAP_WEB_KEY`</el-tag>
          </div>
          <el-table :data="stations" v-loading="loading" stripe border>
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="stationName" label="快递点名称" min-width="170" />
            <el-table-column prop="campusArea" label="校区区域" width="120" />
            <el-table-column prop="detailAddress" label="详细地址" min-width="220" show-overflow-tooltip />
            <el-table-column label="经纬度" width="180">
              <template #default="scope">
                {{ scope.row.longitude }}, {{ scope.row.latitude }}
              </template>
            </el-table-column>
            <el-table-column prop="serviceTime" label="营业时间" width="140" />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.enabled === 1 ? 'success' : 'info'">
                  {{ scope.row.enabled === 1 ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" :icon="Edit" @click="openStationDialog(scope.row)">编辑</el-button>
                <el-button type="danger" size="small" :icon="Close" @click="removeStation(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 系统参数页面 -->
        <div v-else-if="activeMenu === 'configs'" class="page-container">
          <h2 class="page-title">系统参数</h2>
          <div class="table-toolbar">
            <el-button type="primary" :icon="Plus" @click="addConfig">新增参数</el-button>
          </div>
          <el-table :data="sortedConfigs" v-loading="loading" stripe border>
            <el-table-column prop="id" label="ID" width="70" align="center" />
            <el-table-column prop="configKey" label="参数键" min-width="180">
              <template #default="scope">
                <el-input
                  v-if="scope.row.isNew || scope.row.isEditing"
                  v-model="scope.row.configKey"
                  placeholder="输入参数键"
                />
                <span v-else class="config-key">{{ scope.row.configKey }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="configValue" label="参数值" min-width="180" show-overflow-tooltip>
              <template #default="scope">
                <el-input
                  v-if="scope.row.isNew || scope.row.isEditing"
                  v-model="scope.row.configValue"
                  placeholder="输入参数值"
                  type="textarea"
                  :rows="scope.row.configValue && String(scope.row.configValue).length > 80 ? 3 : 2"
                />
                <span v-else class="config-text config-value-text" :title="scope.row.configValue || ''">
                  {{ scope.row.configValue || "-" }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="configDesc" label="参数描述" min-width="250">
              <template #default="scope">
                <el-input
                  v-if="scope.row.isNew || scope.row.isEditing"
                  v-model="scope.row.configDesc"
                  placeholder="输入参数描述"
                  type="textarea"
                  :rows="scope.row.configDesc && String(scope.row.configDesc).length > 80 ? 3 : 2"
                />
                <span v-else class="config-text" :title="scope.row.configDesc || ''">
                  {{ scope.row.configDesc || "-" }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="是否启用" width="110" align="center">
              <template #default="scope">
                <el-switch
                  v-if="scope.row.isNew || scope.row.isEditing"
                  v-model="scope.row.enabled"
                  :active-value="1"
                  :inactive-value="0"
                  inline-prompt
                  active-text="启用"
                  inactive-text="停用"
                />
                <el-tag v-else :type="scope.row.enabled === 1 ? 'success' : 'info'">
                  {{ scope.row.enabled === 1 ? "启用" : "停用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right" align="center">
              <template #default="scope">
                <div class="config-actions">
                  <el-button
                    v-if="!scope.row.isNew && !scope.row.isEditing"
                    type="primary"
                    size="small"
                    :icon="Edit"
                    @click="editConfig(scope.row)"
                  >编辑</el-button>
                  <el-button
                    v-else
                    type="success"
                    size="small"
                    :icon="Check"
                    @click="save(scope.row)"
                  >保存</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Close"
                    @click="removeConfig(scope.row, scope.$index)"
                  >删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
  </div>

  <!-- 编辑用户对话框 -->
  <el-dialog v-model="userDialogVisible" title="编辑用户" width="500px">
    <el-form :model="editingUser" label-width="100px">
      <el-form-item label="昵称">
        <el-input v-model="editingUser.nickname" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="editingUser.phone" />
      </el-form-item>
      <el-form-item label="宿舍">
        <el-input v-model="editingUser.dormitory" />
      </el-form-item>
      <el-form-item label="学院">
        <el-input v-model="editingUser.college" />
      </el-form-item>
      <el-form-item label="信用分">
        <el-input-number v-model="editingUser.creditScore" :min="0" :max="100" />
      </el-form-item>
      <el-form-item label="环保分">
        <el-input-number v-model="editingUser.greenScore" :min="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="userDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveUser">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="stationDialogVisible" title="快递点信息" width="620px">
    <el-form :model="editingStation" label-width="100px">
      <el-form-item label="快递点名称">
        <el-input v-model="editingStation.stationName" />
      </el-form-item>
      <el-form-item label="校区区域">
        <el-input v-model="editingStation.campusArea" placeholder="如：东区 / 西区" />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="editingStation.detailAddress" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="经度">
        <el-input-number v-model="editingStation.longitude" :precision="6" :step="0.000001" :controls="false" style="width: 100%" />
      </el-form-item>
      <el-form-item label="纬度">
        <el-input-number v-model="editingStation.latitude" :precision="6" :step="0.000001" :controls="false" style="width: 100%" />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input v-model="editingStation.contactName" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="editingStation.contactPhone" />
      </el-form-item>
      <el-form-item label="营业时间">
        <el-input v-model="editingStation.serviceTime" placeholder="如：08:00-20:00" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="editingStation.sortOrder" :min="0" style="width: 100%" />
      </el-form-item>
      <el-form-item label="启用状态">
        <el-switch v-model="editingStation.enabled" :active-value="1" :inactive-value="0" inline-prompt active-text="启用" inactive-text="停用" />
      </el-form-item>
      <el-form-item label="高德 POI ID">
        <el-input v-model="editingStation.amapPoiId" placeholder="可选，不填也可以" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editingStation.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="stationDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveStationData">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Bell,
  ChatDotRound,
  Check,
  CircleCheck,
  CircleClose,
  Close,
  Document,
  Download,
  Edit,
  Expand,
  Fold,
  Lock,
  Location,
  Odometer,
  Plus,
  Refresh,
  Search,
  Setting,
  ShoppingCart,
  Stamp,
  SwitchButton,
  Tools,
  Unlock,
  User,
  Warning,
  Timer
} from "@element-plus/icons-vue";
import {
  approveAuth,
  exportOrders as exportOrdersApi,
  forceCancelOrder,
  freezeUser,
  getAppeals,
  getFeedbacks,
  getConfigs,
  getDashboard,
  getOrders,
  getStations,
  getPendingAuth,
  getAllAuth,
  getUsers,
  login,
  deleteConfig as deleteConfigApi,
  deleteStation as deleteStationApi,
  rejectAuth,
  resolveFeedback,
  resolveAppeal,
  saveConfig,
  saveStation as saveStationApi,
  toggleCourier,
  updateUser,
  resetPassword as resetPasswordApi
} from "./api";

// 状态
const isLogin = ref(!!localStorage.getItem("admin_token"));
const loading = ref(false);
const loginForm = ref({ username: "admin", password: "admin123" });
const userSearch = ref("");
const isCollapse = ref(false);
const activeMenu = ref("dashboard");

// 分页参数
const userPage = ref(1);
const userPageSize = ref(20);
const userTotal = ref(0);
const orderPage = ref(1);
const orderPageSize = ref(20);
const orderTotal = ref(0);
const authPage = ref(1);
const authPageSize = ref(20);
const authTotal = ref(0);
const appealPage = ref(1);
const appealPageSize = ref(20);
const appealTotal = ref(0);
const appealStatusFilter = ref("");
const appealTypeFilter = ref("");
const feedbackPage = ref(1);
const feedbackPageSize = ref(20);
const feedbackTotal = ref(0);
const feedbackUserIdFilter = ref("");
const feedbackTypeFilter = ref("");
const feedbackStatusFilter = ref("");

// 数据
const users = ref<any[]>([]);
const pendingAuth = ref<any[]>([]);
const allAuthList = ref<any[]>([]);
const authStatusFilter = ref("");
const appeals = ref<any[]>([]);
const feedbacks = ref<any[]>([]);
const orders = ref<any[]>([]);
const userDialogVisible = ref(false);
const editingUser = ref<any>({});
const configs = ref<any[]>([]);
const stations = ref<any[]>([]);
const stationDialogVisible = ref(false);
const editingStation = ref<any>({});
const dashboard = ref<Record<string, number>>({});
const statusFilter = ref("");

// 计算属性
const completionRate = computed(() => {
  const total = dashboard.value.totalOrders || 0;
  const completed = dashboard.value.completedOrders || 0;
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
});

const completionColor = computed(() => {
  const rate = completionRate.value;
  if (rate >= 80) return "#67C23A";
  if (rate >= 60) return "#E6A23C";
  return "#F56C6C";
});

const orderStatusPercentages = computed(() => {
  const total = dashboard.value.totalOrders || 0;
  const completed = dashboard.value.completedOrders || 0;
  const pendingGrab = dashboard.value.pendingGrabOrders || 0;
  const toPickup = dashboard.value.toPickupOrders || 0;
  const delivering = dashboard.value.deliveringOrders || 0;
  const appealing = dashboard.value.appealingOrders || 0;
  const cancelled = dashboard.value.cancelledOrders || 0;
  
  if (total === 0) {
    return { completed: 0, pendingGrab: 0, toPickup: 0, delivering: 0, appealing: 0, cancelled: 0 };
  }
  
  return {
    completed: Math.round((completed / total) * 100),
    pendingGrab: Math.round((pendingGrab / total) * 100),
    toPickup: Math.round((toPickup / total) * 100),
    delivering: Math.round((delivering / total) * 100),
    appealing: Math.round((appealing / total) * 100),
    cancelled: Math.round((cancelled / total) * 100)
  };
});

const authPercentage = computed(() => {
  const total = userTotal.value || 0;
  const auth = authTotal.value || 0;
  if (total === 0) return 0;
  return Math.round((auth / total) * 100);
});

const appealPendingPercentage = computed(() => {
  const total = appealTotal.value || 0;
  const pending = pendingAppealsCount.value;
  if (total === 0) return 0;
  return Math.round((pending / total) * 100);
});

const appealResolvedPercentage = computed(() => {
  const total = appealTotal.value || 0;
  const resolved = total - pendingAppealsCount.value;
  if (total === 0) return 0;
  return Math.round((resolved / total) * 100);
});

const pendingAppealsCount = computed(() => {
  return appeals.value.filter(a => a.status === "PENDING").length;
});

const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value;
  const search = userSearch.value.toLowerCase();
  return users.value.filter(u => 
    (u.studentNo && u.studentNo.toLowerCase().includes(search)) ||
    (u.nickname && u.nickname.toLowerCase().includes(search))
  );
});

const getAuthStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "待审核",
    APPROVED: "已通过",
    REJECTED: "已驳回"
  };
  return map[status] || status;
};

const getAuthStatusType = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "danger"
  };
  return map[status] || "info";
};

const getAppealStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "待处理",
    DONE: "已通过",
    RESOLVED: "已通过",
    REJECTED: "已驳回"
  };
  return map[status] || status || "-";
};

const getAppealStatusType = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "warning",
    DONE: "success",
    RESOLVED: "success",
    REJECTED: "danger"
  };
  return map[status] || "info";
};

const getAppealTypeText = (type: string) => {
  const map: Record<string, string> = {
    COMPLAINT: "投诉",
    APPEAL: "申诉"
  };
  return map[type] || type || "-";
};

const getAppealTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    COMPLAINT: "danger",
    APPEAL: "warning"
  };
  return map[type] || "info";
};

const filteredAuthList = computed(() => {
  if (!authStatusFilter.value) return allAuthList.value;
  return allAuthList.value.filter(auth => auth.status === authStatusFilter.value);
});

const sortedConfigs = computed(() => {
  return [...configs.value].sort((a, b) => {
    const aId = typeof a.id === "number" ? a.id : Number.MAX_SAFE_INTEGER;
    const bId = typeof b.id === "number" ? b.id : Number.MAX_SAFE_INTEGER;
    return aId - bId;
  });
});

// 菜单选择
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

// 加载所有数据
const loadAll = async () => {
  loading.value = true;
  try {
    const [usersRes, authRes, allAuthRes, appealsRes, feedbacksRes, ordersRes, configsRes, stationsRes, dashboardRes] = await Promise.all([
      getUsers(userPage.value, userPageSize.value),
      getPendingAuth(),
      getAllAuth(authPage.value, authPageSize.value),
      getAppeals({
        page: appealPage.value,
        size: appealPageSize.value,
        status: appealStatusFilter.value || undefined,
        appealType: appealTypeFilter.value || undefined
      }),
      getFeedbacks({
        page: feedbackPage.value,
        size: feedbackPageSize.value,
        userId: feedbackUserIdFilter.value || undefined,
        feedbackType: feedbackTypeFilter.value || undefined,
        status: feedbackStatusFilter.value || undefined
      }),
      getOrders(undefined, orderPage.value, orderPageSize.value),
      getConfigs(),
      getStations(),
      getDashboard()
    ]);
    users.value = usersRes.data.data?.records || [];
    userTotal.value = usersRes.data.data?.total || 0;
    pendingAuth.value = authRes.data.data || [];
    allAuthList.value = allAuthRes.data.data?.records || [];
    authTotal.value = allAuthRes.data.data?.total || 0;
    appeals.value = appealsRes.data.data?.records || [];
    appealTotal.value = appealsRes.data.data?.total || 0;
    feedbacks.value = feedbacksRes.data.data?.records || [];
    feedbackTotal.value = feedbacksRes.data.data?.total || 0;
    orders.value = ordersRes.data.data?.records || [];
    orderTotal.value = ordersRes.data.data?.total || 0;
    configs.value = (configsRes.data.data || []).map((item: any) => ({
      ...item,
      enabled: item.enabled ?? 1,
      isEditing: false,
      isNew: false
    }));
    stations.value = stationsRes.data.data || [];
    dashboard.value = dashboardRes.data.data || {};
  } catch (error) {
    ElMessage.error("数据加载失败");
  } finally {
    loading.value = false;
  }
};

// 用户分页处理
const handleUserPageChange = (page: number) => {
  userPage.value = page;
  loadUsers();
};

const handleUserPageSizeChange = (size: number) => {
  userPageSize.value = size;
  userPage.value = 1;
  loadUsers();
};

const loadUsers = async () => {
  loading.value = true;
  try {
    const res = await getUsers(userPage.value, userPageSize.value);
    users.value = res.data.data?.records || [];
    userTotal.value = res.data.data?.total || 0;
  } finally {
    loading.value = false;
  }
};

// 实名认证分页处理
const handleAuthPageChange = (page: number) => {
  authPage.value = page;
  loadAuth();
};

const handleAuthPageSizeChange = (size: number) => {
  authPageSize.value = size;
  authPage.value = 1;
  loadAuth();
};

const loadAuth = async () => {
  loading.value = true;
  try {
    const res = await getAllAuth(authPage.value, authPageSize.value);
    allAuthList.value = res.data.data?.records || [];
    authTotal.value = res.data.data?.total || 0;
  } finally {
    loading.value = false;
  }
};

// 申诉处理分页处理
const handleAppealPageChange = (page: number) => {
  appealPage.value = page;
  loadAppeals();
};

const handleAppealPageSizeChange = (size: number) => {
  appealPageSize.value = size;
  appealPage.value = 1;
  loadAppeals();
};

const loadAppeals = async () => {
  loading.value = true;
  try {
    const res = await getAppeals({
      page: appealPage.value,
      size: appealPageSize.value,
      status: appealStatusFilter.value || undefined,
      appealType: appealTypeFilter.value || undefined
    });
    appeals.value = res.data.data?.records || [];
    appealTotal.value = res.data.data?.total || 0;
  } finally {
    loading.value = false;
  }
};

const applyAppealFilters = () => {
  appealPage.value = 1;
  loadAppeals();
};

const resetAppealFilters = () => {
  appealStatusFilter.value = "";
  appealTypeFilter.value = "";
  appealPage.value = 1;
  loadAppeals();
};

const handleFeedbackPageChange = (page: number) => {
  feedbackPage.value = page;
  loadFeedbacks();
};

const handleFeedbackPageSizeChange = (size: number) => {
  feedbackPageSize.value = size;
  feedbackPage.value = 1;
  loadFeedbacks();
};

const loadFeedbacks = async () => {
  loading.value = true;
  try {
    const res = await getFeedbacks({
      page: feedbackPage.value,
      size: feedbackPageSize.value,
      userId: feedbackUserIdFilter.value || undefined,
      feedbackType: feedbackTypeFilter.value || undefined,
      status: feedbackStatusFilter.value || undefined
    });
    feedbacks.value = res.data.data?.records || [];
    feedbackTotal.value = res.data.data?.total || 0;
  } finally {
    loading.value = false;
  }
};

const applyFeedbackFilters = () => {
  feedbackPage.value = 1;
  loadFeedbacks();
};

const resetFeedbackFilters = () => {
  feedbackUserIdFilter.value = "";
  feedbackTypeFilter.value = "";
  feedbackStatusFilter.value = "";
  feedbackPage.value = 1;
  loadFeedbacks();
};

// 登录
const doLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning("请输入账号和密码");
    return;
  }
  loading.value = true;
  try {
    const res = await login(loginForm.value.username, loginForm.value.password);
    if (res.data.code !== 0) {
      ElMessage.error(res.data.message || "登录失败");
      return;
    }
    localStorage.setItem("admin_token", res.data.data.token);
    isLogin.value = true;
    ElMessage.success("登录成功");
    await loadAll();
  } catch (error) {
    ElMessage.error("登录失败");
  } finally {
    loading.value = false;
  }
};

// 退出
const logout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    localStorage.removeItem("admin_token");
    isLogin.value = false;
    ElMessage.success("已退出登录");
  });
};

// 审核通过
const approve = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要通过该实名认证申请吗？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    await approveAuth(id);
    ElMessage.success("审核通过");
    await loadAll();
  } catch (error) {
    // 用户取消
  }
};

// 审核驳回
const reject = async (id: number) => {
  try {
    const result = await ElMessageBox.prompt("请输入驳回原因", "驳回实名认证", {
      inputValue: "资料不完整",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
    if (result.action === "confirm") {
      await rejectAuth(id, result.value || "资料不完整");
      ElMessage.success("已驳回");
      await loadAll();
    }
  } catch (error) {
    // 用户取消
  }
};

// 处理通过
const approveAppeal = async (appeal: any) => {
  const typeText = getAppealTypeText(appeal?.appealType);
  try {
    const result = await ElMessageBox.prompt("请输入处理结果", `同意${typeText}`, {
      inputValue: typeText === "投诉" ? "投诉已受理并处理完成" : "申诉已通过",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
    if (result.action === "confirm") {
      await resolveAppeal(appeal.id, "DONE", result.value || (typeText === "投诉" ? "投诉已受理并处理完成" : "申诉已通过"));
      ElMessage.success("处理完成");
      await loadAll();
    }
  } catch (error) {
    // 用户取消
  }
};

// 处理驳回
const rejectAppeal = async (appeal: any) => {
  const typeText = getAppealTypeText(appeal?.appealType);
  try {
    const result = await ElMessageBox.prompt("请输入处理结果", `驳回${typeText}`, {
      inputValue: typeText === "投诉" ? "投诉证据不足，暂不支持" : "申诉不通过",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
    if (result.action === "confirm") {
      await resolveAppeal(appeal.id, "REJECTED", result.value || (typeText === "投诉" ? "投诉证据不足，暂不支持" : "申诉不通过"));
      ElMessage.success("处理完成");
      await loadAll();
    }
  } catch (error) {
    // 用户取消
  }
};

const handleFeedback = async (id: number) => {
  try {
    const result = await ElMessageBox.prompt("请输入反馈处理结果", "处理反馈", {
      inputValue: "已收到反馈，我们会尽快优化处理",
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    });
    if (result.action === "confirm") {
      await resolveFeedback(id, result.value || "已收到反馈，我们会尽快优化处理");
      ElMessage.success("反馈处理完成");
      await loadFeedbacks();
    }
  } catch (error) {
    // 用户取消
  }
};

// 编辑用户
const editUser = (user: any) => {
  editingUser.value = { ...user };
  userDialogVisible.value = true;
};

// 保存用户
const saveUser = async () => {
  if (!editingUser.value.id) return;
  loading.value = true;
  try {
    await updateUser(editingUser.value.id, editingUser.value);
    ElMessage.success("更新成功");
    userDialogVisible.value = false;
    await loadAll();
  } catch (error) {
    ElMessage.error("更新失败");
  } finally {
    loading.value = false;
  }
};

// 重置密码
const resetPassword = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要重置该用户密码为 123456 吗？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    await resetPasswordApi(id);
    ElMessage.success("密码已重置为 123456");
    await loadAll();
  } catch (error) {
    // 用户取消
  }
};

// 冻结/解冻用户
const changeFreeze = async (id: number, status: number) => {
  try {
    const action = status === 1 ? "冻结" : "解冻";
    await ElMessageBox.confirm(`确定要${action}该用户吗？`, "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    await freezeUser(id, status);
    ElMessage.success(`${action}成功`);
    await loadAll();
  } catch (error) {
    // 用户取消
  }
};

// 启用/禁用代取员
const toggleCourierEnabled = async (id: number, enabled: number) => {
  try {
    const action = enabled === 1 ? "启用" : "禁用";
    await ElMessageBox.confirm(`确定要${action}该用户的代取员权限吗？`, "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    await toggleCourier(id, enabled);
    ElMessage.success(`${action}成功`);
    await loadAll();
  } catch (error) {
    // 用户取消
  }
};

// 加载订单
const loadOrders = async () => {
  loading.value = true;
  try {
    const res = await getOrders(statusFilter.value || undefined, orderPage.value, orderPageSize.value);
    orders.value = res.data.data?.records || [];
    orderTotal.value = res.data.data?.total || 0;
  } finally {
    loading.value = false;
  }
};

// 订单分页处理
const handleOrderPageChange = (page: number) => {
  orderPage.value = page;
  loadOrders();
};

const handleOrderPageSizeChange = (size: number) => {
  orderPageSize.value = size;
  orderPage.value = 1;
  loadOrders();
};

// 取消订单
const cancel = async (id: number) => {
  try {
    const result = await ElMessageBox.prompt("请输入取消原因", "强制取消订单", {
      inputValue: "管理员强制取消",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    if (result.action === "confirm") {
      await forceCancelOrder(id, result.value || "管理员强制取消");
      ElMessage.success("订单已取消");
      await loadOrders();
      const dashboardRes = await getDashboard();
      dashboard.value = dashboardRes.data.data || {};
    }
  } catch (error) {
    // 用户取消
  }
};

// 导出订单
const exportOrders = async () => {
  loading.value = true;
  try {
    const res = await exportOrdersApi(statusFilter.value || undefined);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orders.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success("导出成功");
  } catch (error) {
    ElMessage.error("导出失败");
  } finally {
    loading.value = false;
  }
};

// 新增参数
const addConfig = () => {
  configs.value.push({ isNew: true, isEditing: true, configKey: "", configValue: "", configDesc: "", enabled: 1 });
};

const editConfig = (config: any) => {
  config.isEditing = true;
};

const openStationDialog = (station?: any) => {
  editingStation.value = station
    ? { ...station }
    : {
        stationName: "",
        campusArea: "",
        detailAddress: "",
        longitude: undefined,
        latitude: undefined,
        contactName: "",
        contactPhone: "",
        serviceTime: "",
        sortOrder: 0,
        enabled: 1,
        amapPoiId: "",
        description: ""
      };
  stationDialogVisible.value = true;
};

const saveStationData = async () => {
  loading.value = true;
  try {
    await saveStationApi(editingStation.value);
    ElMessage.success("快递点保存成功");
    stationDialogVisible.value = false;
    await loadAll();
  } catch (error) {
    ElMessage.error("快递点保存失败");
  } finally {
    loading.value = false;
  }
};

const removeStation = async (id: number) => {
  try {
    await ElMessageBox.confirm("确定要删除这个快递点吗？", "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    await deleteStationApi(id);
    ElMessage.success("删除成功");
    await loadAll();
  } catch (error) {
    // 用户取消
  }
};

// 保存参数
const save = async (config: any) => {
  loading.value = true;
  try {
    await saveConfig({
      id: config.id,
      configKey: config.configKey,
      configValue: config.configValue,
      configDesc: config.configDesc,
      enabled: config.enabled
    });
    ElMessage.success("保存成功");
    config.isNew = false;
    config.isEditing = false;
    await loadAll();
  } catch (error) {
    ElMessage.error("保存失败");
  } finally {
    loading.value = false;
  }
};

const removeConfig = async (config: any, index: number) => {
  if (config.isNew || !config.id) {
    const targetIndex = configs.value.indexOf(config);
    if (targetIndex !== -1) {
      configs.value.splice(targetIndex, 1);
    } else if (index >= 0) {
      configs.value.splice(index, 1);
    }
    ElMessage.success("已移除未保存参数");
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除系统参数 ${config.configKey} 吗？`, "确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    });
    loading.value = true;
    await deleteConfigApi(config.id);
    ElMessage.success("删除成功");
    await loadAll();
  } catch (error: any) {
    if (error !== "cancel" && error !== "close" && error?.message !== "cancel") {
      ElMessage.error("删除失败");
    }
  } finally {
    loading.value = false;
  }
};

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN");
};

const maskPhone = (phone: string) => {
  if (!phone) return "-";
  if (phone.length <= 7) return phone;
  return phone.substring(0, 3) + "****" + phone.substring(phone.length - 4);
};

const getCreditTagType = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
};

const getOrderStatusText = (order: any) => {
  const map: Record<string, string> = {
    PENDING_GRAB: "待抢单",
    GRABBED: "已抢单",
    DELIVERING: "配送中",
    DELIVERED: "已送达",
    COMPLETED: "已完成",
    CANCELED: "已取消",
    CANCELLED: "已取消",
    APPEALING: "申诉中"
  };
  return map[order.status] || order.status;
};

const getOrderStatusType = (status: string) => {
  const map: Record<string, string> = {
    PENDING_GRAB: "warning",
    GRABBED: "primary",
    DELIVERING: "info",
    DELIVERED: "primary",
    COMPLETED: "success",
    CANCELED: "info",
    CANCELLED: "info",
    APPEALING: "danger"
  };
  return map[status] || "info";
};

const getFeedbackTypeText = (type: string) => {
  const map: Record<string, string> = {
    BUG: "功能异常",
    SUGGESTION: "页面建议",
    ACCOUNT: "账号问题",
    OTHER: "其他反馈"
  };
  return map[type] || type;
};

const getFeedbackTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    BUG: "danger",
    SUGGESTION: "success",
    ACCOUNT: "warning",
    OTHER: "info"
  };
  return map[type] || "info";
};

const getFeedbackStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "待处理",
    PROCESSED: "已处理"
  };
  return map[status] || status;
};

const getFeedbackStatusType = (status: string) => {
  const map: Record<string, string> = {
    PENDING: "warning",
    PROCESSED: "success"
  };
  return map[status] || "info";
};

// 初始化
onMounted(() => {
  if (isLogin.value) {
    loadAll();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 登录页面样式 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 80% 30%, rgba(245, 108, 108, 0.1) 0%, transparent 25%),
    radial-gradient(circle at 20% 70%, rgba(103, 194, 58, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 70% 80%, rgba(230, 162, 60, 0.1) 0%, transparent 25%);
  pointer-events: none;
}

.login-content {
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.login-title {
  font-size: 32px;
  color: #303133;
  margin-bottom: 40px;
  font-weight: 600;
  letter-spacing: 2px;
}

.login-tab {
  position: relative;
  margin-bottom: 30px;
  display: inline-block;
}

.active-tab {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 500;
}

.tab-underline {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  background-color: #f56c6c;
}

.login-form {
  padding: 0;
}

.login-input {
  margin-bottom: 20px;
}

.login-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  background-color: #fff;
}

.login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}

.login-button {
  width: 100%;
  background-color: #f56c6c;
  border-color: #f56c6c;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
}

.login-button:hover {
  background-color: #f78989 !important;
  border-color: #f78989 !important;
}

.login-button:active {
  background-color: #e45656 !important;
  border-color: #e45656 !important;
}

/* 管理后台布局样式 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  height: 100vh;
  background: linear-gradient(180deg, #304156 0%, #1a252f 100%);
  transition: width 0.3s;
  overflow-x: hidden;
  overflow-y: auto;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: rgba(0, 0, 0, 0.2);
}

.sidebar-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-left: 12px;
  white-space: nowrap;
}

.sidebar-menu {
  border: none;
  background-color: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.sidebar-menu .el-menu-item {
  color: #bfcbd9;
}

.sidebar-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 100vh;
  margin-left: 220px;
  transition: margin-left 0.3s;
}

.main-container.collapsed {
  margin-left: 64px;
}

/* 顶部栏样式 */
.top-header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* 内容区样式 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 页面标题 */
.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 600;
}

/* 数据概览页面 */
.dashboard-page {
  padding: 0;
}

.dashboard-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.stat-icon.green {
  background: linear-gradient(135deg, #67c23a, #95d475);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #e6a23c, #f3d19e);
}

.stat-icon.red {
  background: linear-gradient(135deg, #f56c6c, #fab6b6);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

/* 完成率卡片 */
.completion-card {
  margin-bottom: 20px;
  padding: 24px;
}

.completion-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 20px;
  font-weight: 600;
}

.completion-desc {
  text-align: center;
  margin-top: 12px;
  color: #909399;
  font-size: 14px;
}

/* 快速统计 */
.quick-stats {
  margin-bottom: 20px;
}

.quick-stat-card {
  padding: 24px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
}

.quick-stat-header {
  margin-bottom: 24px;
}

.quick-stat-title {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.quick-stat-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-stat-label {
  color: #606266;
  font-size: 14px;
}

.quick-stat-value {
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

/* 可视化卡片 */
.visualization-row {
  margin-bottom: 20px;
}

.visualization-card {
  padding: 24px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
}

.visualization-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 24px;
  font-weight: 600;
}

/* 订单状态分布 */
.order-status-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-label {
  width: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.green {
  background-color: #67c23a;
}

.status-dot.orange {
  background-color: #e6a23c;
}

.status-dot.danger {
  background-color: #f56c6c;
}

.status-dot.info {
  background-color: #909399;
}

.status-progress {
  flex: 1;
}

.status-value {
  width: 50px;
  text-align: right;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 完成率可视化 */
.completion-visual {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 40px;
}

.completion-ring {
  display: flex;
  justify-content: center;
  align-items: center;
}

.completion-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.completion-detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.detail-label {
  color: #606266;
  font-size: 14px;
}

.detail-value {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
}

.detail-value.green {
  color: #67c23a;
}

/* 用户统计可视化 */
.user-stats-visual {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.user-stat-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-stat-label {
  color: #606266;
  font-size: 14px;
}

.user-stat-value {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
}

.user-stat-summary {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

/* 申诉统计可视化 */
.appeal-stats-visual {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.appeal-stat-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appeal-stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appeal-stat-label {
  color: #606266;
  font-size: 14px;
}

.appeal-stat-value {
  color: #303133;
  font-size: 20px;
  font-weight: 700;
}

.appeal-stat-value.warning {
  color: #e6a23c;
}

.appeal-stat-value.success {
  color: #67c23a;
}

/* 表格工具栏 */
.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 6px;
}

.fee-text {
  color: #f56c6c;
  font-weight: 600;
}

.config-key {
  font-family: monospace;
  color: #409eff;
  font-weight: 500;
}

.config-text {
  display: block;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.config-value-text {
  line-height: 32px;
  height: 32px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.config-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .dashboard-cards .el-col {
    margin-bottom: 16px;
  }
}
</style>
