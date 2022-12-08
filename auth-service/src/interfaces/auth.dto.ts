export class SignupRequestDto {
  username!: string;
  password!: string;
}

export class LoginResponse {
  accessToken!: string;
  // TODO - add the refresh token to the response
}
