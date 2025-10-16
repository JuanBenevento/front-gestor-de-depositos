export interface LoginRequest {
  nombre: string;
  contrasenia: string;
}

export interface LoginResponse {
  token: string;
  nombre: string;
  rol: string;
}
