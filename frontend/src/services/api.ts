import axios from 'axios';

// 创建axios实例
// 使用相对路径，通过Vite代理转发到后端
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
};

// 用户API
export const userApi = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// 请假申请API
export const leaveApi = {
  getApplications: (params?: any) => api.get('/leave-applications', { params }),
  getApplication: (id: string) => api.get(`/leave-applications/${id}`),
  createApplication: (data: any) => api.post('/leave-applications', data),
  cancelApplication: (id: string, reason?: string) =>
    api.post(`/leave-applications/${id}/cancel`, { reason }),
  endorse: (id: string, action: 'approve' | 'reject', comment?: string) =>
    api.post(`/leave-applications/${id}/endorse`, { action, comment }),
  hrApprove: (id: string, action: 'approve' | 'reject', comment?: string) =>
    api.post(`/leave-applications/${id}/hr-approve`, { action, comment }),
};

// 余额API
export const balanceApi = {
  getBalances: (params?: any) => api.get('/balances', { params }),
  adjustBalance: (data: any) => api.post('/balances/adjust', data),
};

// 日历API
export const calendarApi = {
  getEvents: (params?: any) => api.get('/calendar/events', { params }),
};

export default api;
