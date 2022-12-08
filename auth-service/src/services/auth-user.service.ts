import chalk from "chalk";
import { sequelize } from "../database/database.service";
import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { Role, SignupRequestDto } from "../interfaces";
import { AuthenticationService } from "./authentication.service";

export class AuthUserService {
  static findOneByEmail(email: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { email } });
  }

  static async create(params: SignupRequestDto): Promise<IAuthUser | null> {
    const hashedPassword = await AuthenticationService.encodePassword(params.password);
    const transaction = await sequelize.transaction();
    try {
      // TODO - refactor the structure of the code
      let result: IAuthUser | null = null;
      result = await AuthUser.create({ email: params.email, password: hashedPassword }, { transaction });
      // Call the users service to create the corresponding user object
      const accessToken = await AuthenticationService.createAccessToken(result.email, result.userId, Role.admin);
      try {
        // TODO - uncomment the below fetch statement once users service is implemented
        // const response = await fetch(`${getEnvVar("USERS_SERVICE_URL", true)}`, {
        //   method: "POST",
        //   headers: new Headers({
        //     Authorization: `Bearer ${accessToken?.accessToken}`,
        //   }),
        //   // TODO - the users service request body has to be updated
        //   body: JSON.stringify({
        //     userId: result.userId,
        //     email: result.email,
        //     name: name,
        //   }),
        // });
        // if (response.status !== 200) {
        //   throw new Error("The users service has responded with status code 200 to the create user request");
        // }
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
