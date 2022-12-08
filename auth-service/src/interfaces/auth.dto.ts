export class SignupRequestDto {
  name!: string;
  email!: string;
  password!: string;
}

export class LoginResponse {
  accessToken!: string;
  // TODO - add the refresh token to the response
}
