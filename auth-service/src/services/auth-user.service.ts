import chalk from "chalk";
import { sequelize } from "../database/database.service";
import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { SignupRequestDto } from "../interfaces";
import { AuthenticationService } from "./authentication.service";

export class AuthUserService {
  static findOneByUsername(username: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { username } });
  }

  static async create(params: SignupRequestDto): Promise<IAuthUser | null> {
    const hashedPassword = await AuthenticationService.encodePassword(params.password);
    const transaction = await sequelize.transaction();
    try {
      let result: IAuthUser | null = null;
      result = await AuthUser.create({ username: params.username, password: hashedPassword }, { transaction });
      // Call the users service to create the corresponding user object
      try {
        // TODO - uncomment the below fetch statement once users service is implemented
        // await fetch(`${getEnvVar("USERS_SERVICE_URL", true)}`, {
        //   method: "POST",
        //   body: JSON.stringify({
        //     userId: result.userId,
        //     username: result.username,
        //   }),
        // });
      } catch (error) {
        console.log(
          new Date().toISOString() +
            chalk.redBright(` [ERROR] POST request to create a user object has failed!`, error.stack)
        );
        throw Error("Post request to create a user object has failed");
      }

      transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create an auth user!`, error.stack));
      return null;
    }
  }
}
