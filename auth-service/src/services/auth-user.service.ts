import { getEnvVar } from "../config/config.service";
import { sequelize } from "../database/database.service";
import { AuthUser, IAuthUser } from "../database/models/auth-user.model";
import { Role, SignupRequestDto } from "../interfaces";
import { log } from "../utils/logger";
import { AuthenticationService } from "./authentication.service";

export class AuthUserService {
  /**
   * Query the database to find a specific user by their email.
   * @param email the email to search for.
   * @returns a promise of the auth user entity or null
   */
  static findOneByEmail(email: string): Promise<IAuthUser | null> {
    return AuthUser.findOne({ where: { email } });
  }

  /**
   * Query the database to create a new user entity.\
   * Performs a HTTP call to Users Service to create a corresponding user entity.
   * @param params the data needed to create a user.
   * @returns a promise of the auth user entity or null
   */
  static async create(params: SignupRequestDto): Promise<IAuthUser | null> {
    const hashedPassword = await AuthenticationService.encodePassword(params.password);
    const transaction = await sequelize.transaction();
    try {
      // Create the auth user
      const result = await AuthUser.create({ email: params.email, password: hashedPassword }, { transaction });

      // If the env variable needed to complete the user creation is missing, revert the database change and return null
      if (!getEnvVar("USERS_SERVICE_URL")) {
        log.warn(`Unable to call Users Service to create a user due to the env variable missing!`);
        transaction.rollback();
        return null;
      }

      // Call the users service to create the corresponding user object. Throw an error if it fails
      try {
        const accessToken = await AuthenticationService.createAccessToken(result.email, result.userId, Role.admin);
        const response = await fetch(`${getEnvVar("USERS_SERVICE_URL")}`, {
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

        // Fail the logic if the response from Users Service was not 201: Created
        if (response.status !== 201) {
          log.warn(
            `The users service at ${getEnvVar("USERS_SERVICE_URL")} has responded with status code ${
              response.status
            } to the create user request!`
          );
          throw new Error(
            `The users service at ${getEnvVar("USERS_SERVICE_URL")} has responded with status code ${
              response.status
            } to the create user request!`
          );
        }
      } catch (error) {
        log.error(`POST request to create a user object has failed!`, error);
        throw Error("Post request to create a user object has failed");
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
