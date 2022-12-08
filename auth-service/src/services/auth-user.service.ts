import { getEnvVar } from "../config/config.service";
import { sequelize } from "../database/database.service";
import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { Role, SignupRequestDto } from "../interfaces";
import { log } from "../utils/logger";
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
      if (!getEnvVar("USERS_SERVICE_URL", false)) {
        log.warn(`Unable to call Users Service to create a user due to the env variable missing!`);
      } else {
        try {
          const accessToken = await AuthenticationService.createAccessToken(result.email, result.userId, Role.admin);
          const response = await fetch(`${getEnvVar("USERS_SERVICE_URL", false)}`, {
            method: "POST",
            headers: new Headers({
              Authorization: `Bearer ${accessToken?.accessToken}`,
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({
              userId: result.userId,
              email: result.email,
              name: params.name,
            }),
          });
          if (response.status !== 201) {
            log.warn(
              `The users service at ${getEnvVar("USERS_SERVICE_URL", false)} has responded with status code ${
                response.status
              } to the create user request!`
            );
            throw new Error(
              `The users service at ${getEnvVar("USERS_SERVICE_URL", false)} has responded with status code ${
                response.status
              } to the create user request!`
            );
          }
        } catch (error) {
          log.error(`POST request to create a user object has failed!`, error);
          throw Error("Post request to create a user object has failed");
        }
      }

      transaction.commit();
      return result;
    } catch (error) {
      transaction.rollback();
      log.error(`Failed to create an auth user!`, error);
      return null;
    }
  }
}
