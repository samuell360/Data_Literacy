/**
 * API Service for connecting frontend to backend
 * Handles all HTTP requests to the FastAPI backend
 */

import { invalidateProgressCaches } from './cache';

// Backend configuration
const VITE_BASE = (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_API_BASE_URL) ||
  (typeof window !== 'undefined' ? (window as any).VITE_API_BASE_URL : undefined) ||
  ''; // Use relative URLs for proxy
const API_ROOT_URL = VITE_BASE.replace(/\/$/, '');
const API_BASE_URL = `${API_ROOT_URL}/api/v1`;

// API response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  bio?: string | null;
  timezone: string;
  preferred_language: string;
  public_profile: boolean;
  allow_emails: boolean;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
  login_count: number;
  avatar_url?: string | null;
}

export interface LoginRequest {
  email_or_username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginApiResponse {
  message: string;
  token: LoginToken;
  login_count: number;
}

export interface MeResponse {
  user: User;
  progress: any;
}

export interface ProgressSummary {
  lessonsCompleted: number;
  totalLessons: number;
  currentWorldId?: number | null;
  currentLessonId?: number | null;
  hasStarted: boolean;
  totalXP: number;
  currentLevel: number;
  currentStreak: number;
}

export interface NextStep {
  type: "lesson" | "quiz" | "simulation";
  worldId: number;
  lessonId?: number;
  title: string;
  link: string;
}

export interface World {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty_level: number;
  estimated_hours: number;
  is_active: boolean;
  modules_count: number;
  user_progress?: string | null;
}

export interface Lesson {
  lesson_id: number;
  title: string;
  estimated_minutes: number;
  status: string;
  locked?: boolean;
}

// HTTP client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = window.localStorage.getItem('auth_token');
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_token', token);
    }
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
    }
  }

  // Get default headers
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Merge headers from options with defaults
  private mergeHeaders(optionsHeaders?: HeadersInit): Record<string, string> {
    const headers = { ...this.getHeaders() };

    if (optionsHeaders) {
      if (typeof Headers !== 'undefined' && optionsHeaders instanceof Headers) {
        optionsHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(optionsHeaders)) {
        for (const [key, value] of optionsHeaders) {
          headers[key] = value;
        }
      } else {
        Object.assign(headers, optionsHeaders as Record<string, string>);
      }
    }

    return headers;
  }

  // Generic HTTP request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.mergeHeaders(options.headers);

    const config: RequestInit = {
      ...options,
      headers,
    };

    if (typeof config.body === 'string' && !('Content-Type' in headers)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add timeout for requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        const message =
          (data && (data.error || data.detail || data.message)) ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout: ${url}`);
        console.error(`API request timeout: ${url}`);
        throw timeoutError;
      }
      
      // Only log non-auth errors as errors
      if (!url.includes('/auth/me') && !url.includes('/auth/login')) {
        console.error(`API request failed: ${url}`, error);
      } else {
        console.debug(`API request failed: ${url}`, error);
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    let body: BodyInit | undefined;

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      body = data;
    } else if (data !== undefined) {
      body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    let body: BodyInit | undefined;

    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      body = data;
    } else if (data !== undefined) {
      body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginApiResponse> {
    const response = await this.post<LoginApiResponse>('/auth/login', credentials);

    if (response?.token?.access_token) {
      this.setToken(response.token.access_token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<User> {
    const response = await this.post<User>('/auth/register', userData);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  async getMe(): Promise<MeResponse> {
    return this.get<MeResponse>('/me');
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${API_ROOT_URL}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          (errorData && (errorData.error || errorData.detail || errorData.message)) ||
          `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed: health check', error);
      throw error;
    }
  }

  // Learning content methods
  async getWorlds(): Promise<World[]> {
    return this.get('/worlds');
  }

  async getWorldById(worldId: string): Promise<any> {
    return this.get(`/worlds/${worldId}`);
  }

  async getWorldStats(worldId: number): Promise<any> {
    return this.get(`/worlds/${worldId}/stats`);
  }

  async getWorldResources(worldId: number): Promise<any[]> {
    return this.get(`/worlds/${worldId}/resources`);
  }

  async getWorldProjects(worldId: number): Promise<any[]> {
    return this.get(`/worlds/${worldId}/projects`);
  }

  // Progress tracking
  async getUserProgress(): Promise<any> {
    return this.get('/progress/dashboard');
  }

  async getProgressSummary(): Promise<ProgressSummary> {
    return this.get('/progress/summary');
  }

  async getNextStep(): Promise<NextStep | null> {
    return this.get('/progress/next');
  }

  // Removed updateProgress: no backend endpoint; use startLesson/completeLesson

  async completeLesson(lessonId: number, score: number, time_spent_seconds: number): Promise<any> {
    // Normalize to 0.0–1.0 in case callers pass 0–100
    const normalized = score > 1 ? Math.max(0, Math.min(100, score)) / 100 : Math.max(0, Math.min(1, score));
    const params = new URLSearchParams({ score: String(normalized), time_spent_seconds: String(time_spent_seconds) });
    return this.post(`/progress/lesson/${lessonId}/complete?${params.toString()}`);
  }

  // Quiz endpoints
  async getQuizQuestions(lessonId: number): Promise<any> {
    return this.get(`/quiz/lesson/${lessonId}/questions`);
  }

  async submitQuiz(lessonId: number, answers: Array<{question_id: number, answer: string}>): Promise<any> {
    return this.post(`/quiz/lesson/${lessonId}/submit`, { answers });
  }

  async startLesson(lessonId: number): Promise<any> {
    return this.post(`/progress/lesson/${lessonId}/start`);
  }
  
  async getLesson(lessonId: number): Promise<any> {
    return this.get(`/progress/lesson/${lessonId}`);
  }

  async listLessons(worldId?: number): Promise<Lesson[]> {
    const qs = worldId ? `?world_id=${worldId}` : '';
    return this.get(`/progress/lessons${qs}`);
  }

  async getLessons(worldId?: number): Promise<Lesson[]> {
    return this.listLessons(worldId);
  }

  // Gamification
  async getUserXP(): Promise<any> {
    const profile: any = await this.get('/gamification/profile');
    return {
      total_xp: profile?.gamification?.total_xp ?? 0,
      level: profile?.gamification?.level ?? 1,
      xp_to_next_level: profile?.gamification?.xp_to_next_level ?? 0,
    };
  }

  async getBadges(): Promise<any[]> {
    const profile: any = await this.get('/gamification/profile');
    return profile?.recent_badges ?? [];
  }

  async getLeaderboard(): Promise<any[]> {
    return this.get('/gamification/leaderboard');
  }

  // Simulations
  async runSimulation(simulationId: number, parameters: any): Promise<any> {
    return this.post(`/simulations/run/${simulationId}`, { parameters });
  }

  async getSimulationHistory(): Promise<any[]> {
    return this.get('/simulations/history');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export convenience methods
export const authApi = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  register: (userData: RegisterRequest) => apiClient.register(userData),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
};

export const contentApi = {
  getWorlds: () => apiClient.getWorlds(),
  getWorld: (id: string) => apiClient.getWorldById(id),
  getLessons: (worldId?: number) => apiClient.getLessons(worldId),
};

export const progressApi = {
  getUserProgress: () => apiClient.getUserProgress(),
  getProgressSummary: () => apiClient.getProgressSummary(),
  getNextStep: () => apiClient.getNextStep(),
  getLesson: (lessonId: number) => apiClient.getLesson(lessonId),
  completeLesson: async (lessonId: number, score: number, timeSpent: number) => {
    const result = await apiClient.completeLesson(lessonId, score, timeSpent);
    // Invalidate caches after successful completion
    invalidateProgressCaches();
    return result;
  },
  startLesson: async (lessonId: number) => {
    const result = await apiClient.startLesson(lessonId);
    // Invalidate caches after starting lesson
    invalidateProgressCaches();
    return result;
  },
};

export const gamificationApi = {
  getUserXP: () => apiClient.getUserXP(),
  getBadges: () => apiClient.getBadges(),
  getLeaderboard: () => apiClient.getLeaderboard(),
};

export const simulationApi = {
  run: (simulationId: number, parameters: any) => apiClient.runSimulation(simulationId, parameters),
  getHistory: () => apiClient.getSimulationHistory(),
};

export default apiClient;

