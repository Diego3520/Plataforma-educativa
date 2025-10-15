export interface CodeExecutionRequest {
  code: string;
  language: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  output: string;
  error: string;
  execution_time: number;
  memory_used: number;
}

export interface SupportedLanguages {
  [key: string]: {
    extension: string;
    command: string;
    timeout: number;
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  supported_languages: string[];
}

export type SupportedLanguage = 'python';
