import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  User,
  Base,
  Asset,
  Purchase,
  CreateAssetInput,
  CreatePurchaseInput,
  AssetCategory,
  AssetStatus,
} from '../types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
};

export const setToken = (token: string, remember: boolean = true): void => {
  if (remember) {
    localStorage.setItem('auth_token', token);
    sessionStorage.removeItem('auth_token');
  } else {
    sessionStorage.setItem('auth_token', token);
    localStorage.removeItem('auth_token');
  }
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login');
      if (!isAuthEndpoint) {
        removeToken();
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/' &&
          window.location.pathname !== '/select-role'
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string, role?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', {
      username,
      password,
      role,
    });
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

// Base API
export const baseApi = {
  getAll: async (): Promise<Base[]> => {
    const response = await apiClient.get<ApiResponse<Base[]>>('/bases');
    return response.data.data;
  },

  getById: async (id: number): Promise<Base> => {
    const response = await apiClient.get<ApiResponse<Base>>(`/bases/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Base>): Promise<Base> => {
    const response = await apiClient.post<ApiResponse<Base>>('/bases', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Base>): Promise<Base> => {
    const response = await apiClient.put<ApiResponse<Base>>(`/bases/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/bases/${id}`);
  },
};

// Asset API
export const assetApi = {
  getAll: async (params?: {
    baseId?: number;
    category?: AssetCategory;
    status?: AssetStatus;
    equipmentType?: string;
    keyword?: string;
  }): Promise<Asset[]> => {
    const response = await apiClient.get<ApiResponse<Asset[]>>('/assets', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Asset> => {
    const response = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`);
    return response.data.data;
  },

  create: async (data: CreateAssetInput): Promise<Asset> => {
    const response = await apiClient.post<ApiResponse<Asset>>('/assets', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<CreateAssetInput>): Promise<Asset> => {
    const response = await apiClient.put<ApiResponse<Asset>>(`/assets/${id}`, data);
    return response.data.data;
  },

  changeStatus: async (id: number, status: AssetStatus, notes?: string): Promise<Asset> => {
    const response = await apiClient.patch<ApiResponse<Asset>>(`/assets/${id}/status`, {
      status,
      notes,
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/assets/${id}`);
  },

  getCategories: async (): Promise<AssetCategory[]> => {
    const response = await apiClient.get<ApiResponse<AssetCategory[]>>('/assets/categories');
    return response.data.data;
  },

  getStatuses: async (): Promise<AssetStatus[]> => {
    const response = await apiClient.get<ApiResponse<AssetStatus[]>>('/assets/statuses');
    return response.data.data;
  },
};

// Purchase API
export const purchaseApi = {
  getAll: async (params?: {
    baseId?: number;
    category?: AssetCategory;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }): Promise<Purchase[]> => {
    const response = await apiClient.get<ApiResponse<Purchase[]>>('/purchases', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Purchase> => {
    const response = await apiClient.get<ApiResponse<Purchase>>(`/purchases/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePurchaseInput): Promise<Purchase> => {
    const response = await apiClient.post<ApiResponse<Purchase>>('/purchases', data);
    return response.data.data;
  },
};

// Transfer API
export const transferApi = {
  getAll: async (params?: {
    sourceBaseId?: number;
    destinationBaseId?: number;
    category?: AssetCategory;
    status?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }): Promise<import('../types').Transfer[]> => {
    const response = await apiClient.get<ApiResponse<import('../types').Transfer[]>>('/transfers', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<import('../types').Transfer> => {
    const response = await apiClient.get<ApiResponse<import('../types').Transfer>>(`/transfers/${id}`);
    return response.data.data;
  },

  create: async (data: import('../types').CreateTransferInput): Promise<import('../types').Transfer> => {
    const response = await apiClient.post<ApiResponse<import('../types').Transfer>>('/transfers', data);
    return response.data.data;
  },

  approve: async (id: number): Promise<import('../types').Transfer> => {
    const response = await apiClient.put<ApiResponse<import('../types').Transfer>>(`/transfers/${id}/approve`);
    return response.data.data;
  },

  reject: async (id: number, reason: string): Promise<import('../types').Transfer> => {
    const response = await apiClient.put<ApiResponse<import('../types').Transfer>>(`/transfers/${id}/reject`, { reason });
    return response.data.data;
  },

  complete: async (id: number): Promise<import('../types').Transfer> => {
    const response = await apiClient.put<ApiResponse<import('../types').Transfer>>(`/transfers/${id}/complete`);
    return response.data.data;
  },

  cancel: async (id: number): Promise<import('../types').Transfer> => {
    const response = await apiClient.put<ApiResponse<import('../types').Transfer>>(`/transfers/${id}/cancel`);
    return response.data.data;
  },
};

// Assignment API
export const assignmentApi = {
  getAll: async (params?: {
    baseId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }): Promise<import('../types').Assignment[]> => {
    const response = await apiClient.get<ApiResponse<import('../types').Assignment[]>>('/assignments', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<import('../types').Assignment> => {
    const response = await apiClient.get<ApiResponse<import('../types').Assignment>>(`/assignments/${id}`);
    return response.data.data;
  },

  create: async (data: import('../types').CreateAssignmentInput): Promise<import('../types').Assignment> => {
    const response = await apiClient.post<ApiResponse<import('../types').Assignment>>('/assignments', data);
    return response.data.data;
  },

  returnAssignment: async (id: number, data?: import('../types').ReturnAssignmentInput): Promise<import('../types').Assignment> => {
    const response = await apiClient.put<ApiResponse<import('../types').Assignment>>(`/assignments/${id}/return`, data || {});
    return response.data.data;
  },
};

// Expenditure API
export const expenditureApi = {
  getAll: async (params?: {
    baseId?: number;
    category?: AssetCategory;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }): Promise<import('../types').Expenditure[]> => {
    const response = await apiClient.get<ApiResponse<import('../types').Expenditure[]>>('/expenditures', { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<import('../types').Expenditure> => {
    const response = await apiClient.get<ApiResponse<import('../types').Expenditure>>(`/expenditures/${id}`);
    return response.data.data;
  },

  create: async (data: import('../types').CreateExpenditureInput): Promise<import('../types').Expenditure> => {
    const response = await apiClient.post<ApiResponse<import('../types').Expenditure>>('/expenditures', data);
    return response.data.data;
  },
};

// Audit API
export const auditApi = {
  getAll: async (params?: {
    entityName?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }): Promise<import('../types').AuditLog[]> => {
    const response = await apiClient.get<ApiResponse<import('../types').AuditLog[]>>('/audit-logs', { params });
    return response.data.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (params?: {
    baseId?: number;
    category?: AssetCategory;
    equipmentType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<import('../types').DashboardStats> => {
    const response = await apiClient.get<ApiResponse<import('../types').DashboardStats>>('/dashboard/stats', { params });
    return response.data.data;
  },

  getNetMovement: async (params?: {
    baseId?: number;
    category?: AssetCategory;
    startDate?: string;
    endDate?: string;
  }): Promise<import('../types').NetMovementResponse> => {
    const response = await apiClient.get<ApiResponse<import('../types').NetMovementResponse>>('/dashboard/net-movement', { params });
    return response.data.data;
  },
};

// Reports API
export const reportsApi = {
  getReports: async (params?: {
    baseId?: number;
    category?: AssetCategory;
    startDate?: string;
    endDate?: string;
  }): Promise<import('../types').FullReportsResponse> => {
    const response = await apiClient.get<ApiResponse<import('../types').FullReportsResponse>>('/reports', { params });
    return response.data.data;
  },
};


