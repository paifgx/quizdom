/**
 * Real API client for Quizdom application.
 * Handles HTTP requests to the FastAPI backend.
 */

// API Configuration
// In development, use /api prefix to leverage Vite proxy
// In production, use the full API URL from environment variable
// In test environment, use a mock URL to prevent fetch errors
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL || (() => {
      throw new Error('VITE_API_URL environment variable is required in production');
    })()
  : import.meta.env.MODE === 'test'
    ? 'http://localhost:8000' // Mock URL for tests
    : '/api'; // Use /api prefix for development with Vite proxy

// Global error handler for authentication failures
let onAuthError: (() => void) | null = null;

export function setAuthErrorHandler(handler: () => void) {
  onAuthError = handler;
}

/**
 * HTTP client with error handling and JSON parsing.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Makes a GET request to the specified endpoint.
   */
  async get<T>(
    endpoint: string,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('API GET request to:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 && onAuthError) {
          onAuthError();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a POST request to the specified endpoint.
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('API POST request to:', url);
    console.log('Request data:', data);
    console.log('Request headers:', options?.headers);

    try {
      // Determine if data is FormData to handle body and headers correctly
      const isFormData = data instanceof FormData;
      const isUrlEncoded =
        options?.headers?.['Content-Type'] ===
        'application/x-www-form-urlencoded';

      const headers: Record<string, string> = {
        ...(isFormData
          ? {}
          : !isUrlEncoded
            ? { 'Content-Type': 'application/json' }
            : {}),
        ...options?.headers,
      };

      console.log('Final headers:', headers);

      // Determine the body based on content type
      let body: string | FormData | undefined;
      if (isFormData) {
        body = data;
      } else if (isUrlEncoded) {
        body = data as string; // URL-encoded string should be passed as-is
      } else if (data) {
        body = JSON.stringify(data);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies for authentication
        body,
      });

      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 && onAuthError) {
          onAuthError();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a PUT request to the specified endpoint.
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Include cookies for authentication
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 && onAuthError) {
          onAuthError();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a DELETE request to the specified endpoint.
   */
  async delete<T>(
    endpoint: string,
    options?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 && onAuthError) {
          onAuthError();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Health check endpoint.
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.get('/');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
