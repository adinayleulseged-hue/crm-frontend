export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: {
    name: string;
    role: string;
    email: string;
  };
}
