import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { SignupRequestDto } from "../interfaces";

export class AuthUserService {
  static findOne(username: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { username: username } });
  }

  static create(params: SignupRequestDto): Promise<IAuthUser> {
    // TODO - call usersService to create the matching user object. If the request fails, the authUSer creation should be reverted
    return AuthUser.create({ ...params });
  }
}
