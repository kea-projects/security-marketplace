import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { IToken, Token } from "../database/models/token.model";
import { log } from "../utils/logger";

export class TokenService {
  /**
   * Query the database find a specific token pair by one one of the tokens.
   * @param token the token to check for.
   * @returns a promise of the token pair entity or null
   */
  static async findByToken(token: string): Promise<IToken | null> {
    return Token.findOne({ where: { [Op.or]: [{ accessToken: token }, { refreshToken: token }] } });
  }

  /**
   * Query the database find a all token pairs for the specific email.
   * @param token the email to check for.
   * @returns a promise of a list of the token pair entities.
   */
  static async findAllByEmail(email: string): Promise<IToken[]> {
    const tokens = await Token.findAll();
    const filteredTokens = tokens.filter((token) => {
      return jwt.decode(token.refreshToken)?.sub === email;
    });
    return filteredTokens;
  }

  /**
   * Query the database to create a new token pair entity.
   * @param token the token information.
   * @returns a promise of the created token entity.
   */
  static async createToken(token: IToken): Promise<IToken | null> {
    try {
      return Token.create({ ...token });
    } catch (error) {
      log.error(`Failed to create a token!`, error);
      return null;
    }
  }

  /**
   * Query the database to delete all token pairs that contain the given token.
   * @param token the token to search for.
   * @returns whether the query succeeded or not.
   */
  static async deleteByToken(token: string): Promise<boolean> {
    try {
      const result = await Token.destroy({ where: { [Op.or]: [{ accessToken: token }, { refreshToken: token }] } });
      if (result == 0) {
        log.warn(`No tokens were removed when deleteByToken was called!`);
      }
      return result > 0;
    } catch (error) {
      log.error(`Failed to delete a token pair!`, error);
    }
    return false;
  }

  /**
   * Query the database to delete all token pairs of the given user.
   * @param email the user email to search for.
   */
  static async deleteAllOfUser(email: string): Promise<void> {
    try {
      const tokens = await this.findAllByEmail(email);
      const idList = tokens.map((token) => token.tokenId);
      await Token.destroy({ where: { tokenId: idList } });
    } catch (error) {
      log.error(`Failed to delete all auth tokens of a user!`, error);
    }
  }
}
