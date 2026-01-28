import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

// En desarrollo usamos /api para que Vite haga proxy a localhost:8080 y evite CORS
const getBaseURL = () =>
  import.meta.env.DEV ? '/api' : (import.meta.env.VITE_ALONDRA_BACKEND_URL || 'http://localhost:8080/api');

const apiConfig: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación si existe
apiConfig.interceptors.request.use(
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

// Interceptor para manejar respuestas y errores
apiConfig.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Manejar token expirado o no autorizado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos para los parámetros de la función
interface ApiRequestParams {
  method: Method;
  url: string;
  data?: any;
  params?: any;
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

/**
 * Función general para realizar peticiones HTTP
 * @param params - Parámetros de la petición
 * @returns Promise con la respuesta de la API
 */
export const apiRequest = async <T = any>(params: ApiRequestParams): Promise<T> => {
  const { method, url, data, params: queryParams, headers, config } = params;

  try {
    const requestConfig: any = {
      method,
      url,
      data,
      params: queryParams,
      ...config,
    };
    
    if (headers) {
      requestConfig.headers = {
        ...requestConfig.headers,
        ...headers,
      };
    }

    const response = await apiConfig.request<T>(requestConfig);

    return response.data as unknown as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
    }
    throw error;
  }
};

// Funciones helper para métodos HTTP específicos
export const apiGet = <T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ method: 'GET', url, params, config });
};

export const apiPost = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ method: 'POST', url, data, config });
};

export const apiPut = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ method: 'PUT', url, data, config });
};

export const apiPatch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ method: 'PATCH', url, data, config });
};

export const apiDelete = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ method: 'DELETE', url, config });
};

export default apiConfig;
