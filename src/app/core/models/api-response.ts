export class ApiResponse<T> {
  data!: T;
  message?: string;
  error?: boolean;
}
