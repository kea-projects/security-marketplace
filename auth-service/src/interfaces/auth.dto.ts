export class SignupRequestDto {
  username!: string;
  password!: string;
}

export class LoginResponse {
  accessToken!: string;
}
