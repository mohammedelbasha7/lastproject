import axios, { AxiosInstance } from 'axios';
import { getAPIBaseURL } from './config';

const TOKEN_STORAGE_KEY = 'admin_auth_token';
const AUTH_RETURN_TO_KEY = 'auth_return_to';

class RPApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private getBaseURL() {
    return getAPIBaseURL();
  }

  async getCurrentUser() {
    try {
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/me`
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      throw new Error(
        error.response?.data?.detail || 'Failed to get user info'
      );
    }
  }

  async login(returnTo = window.location.pathname + window.location.search) {
    localStorage.setItem(AUTH_RETURN_TO_KEY, returnTo || '/');
    // The backend starts an OIDC redirect flow, so navigate the browser
    // directly instead of requesting it as JSON through XHR.
    window.location.href = `${this.getBaseURL()}/api/v1/auth/login`;
  }

  async logout() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      const response = await this.client.get(
        `${this.getBaseURL()}/api/v1/auth/logout`
      );
      // The backend will redirect to OIDC provider logout
      window.location.href = response.data.redirect_url;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to logout');
    }
  }
}

export const authApi = new RPApi();
export const authTokenStorage = {
  set(token: string) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  get() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};

export const authReturnToStorage = {
  get() {
    return localStorage.getItem(AUTH_RETURN_TO_KEY);
  },
  clear() {
    localStorage.removeItem(AUTH_RETURN_TO_KEY);
  },
};
