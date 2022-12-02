import chalk from "chalk";
import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { SignupRequestDto } from "../interfaces";

export class AuthUserService {
  static findOneByUsername(username: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { username } });
  }

  static findOneByUsernameAndPassword(username: string, password: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { username, password } });
  }

  static async create(params: SignupRequestDto): Promise<IAuthUser | null> {
    // TODO - call usersService to create the matching user object. If the request fails, the authUSer creation should be reverted
    try {
      return AuthUser.create({ ...params });
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create an auth user!`, error.stack));
      return null;
    }
  }
}
