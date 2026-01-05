export interface TaskSubmitBody {
  body: Record<string, any>;
  user: {
    creatorId: number;
    creatorName: string;
  };
}

export interface TaskItem {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  input_data: Record<string, any>;
  creator_id: number;
  creator_name: string;
  status: number;
  result_url: string;
  retry_count: number;
  max_retries: number;
  error_log: string;
}

export interface TaskListParams {
  page?: number;
  page_size?: number;
  status?: number;
  creator_id?: number;
}

export interface TaskListResponse {
  data: {
    total: number;
    items: TaskItem[];
  };
  status: number;
  message: string;
}
