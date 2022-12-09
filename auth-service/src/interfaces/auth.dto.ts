export class SignupRequestDto {
  name!: string;
  email!: string;
  password!: string;
}

export class LoginResponse {
  accessToken!: string;
  refreshToken!: string;
}
