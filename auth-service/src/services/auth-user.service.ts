import chalk from "chalk";
import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { SignupRequestDto } from "../interfaces";
import { AuthenticationService } from "./authentication.service";

export class AuthUserService {
  static findOneByUsername(username: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { username } });
  }

  static async create(params: SignupRequestDto): Promise<IAuthUser | null> {
    // TODO - call usersService to create the matching user object. If the request fails, the authUSer creation should be reverted
    const hashedPassword = await AuthenticationService.encodePassword(params.password);
    try {
      return AuthUser.create({ username: params.username, password: hashedPassword });
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create an auth user!`, error.stack));
      return null;
    }
  }
}
