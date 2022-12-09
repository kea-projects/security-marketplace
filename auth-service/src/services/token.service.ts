import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { IToken, Token } from "../database/models/token.model";
import { log } from "../utils/logger";

export class TokenService {
  static async findByToken(token: string): Promise<IToken | null> {
    return Token.findOne({ where: { [Op.or]: [{ accessToken: token }, { refreshToken: token }] } });
  }

  static async findAllByEmail(email: string): Promise<IToken[]> {
    const tokens = await Token.findAll();
    const filteredTokens = tokens.filter((token) => {
      return jwt.decode(token.refreshToken)?.sub === email;
    });
    return filteredTokens;
  }

  static async createToken(token: IToken): Promise<IToken | null> {
    try {
      return Token.create({ ...token });
    } catch (error) {
      log.error(`Failed to create a token!`, error);
      return null;
    }
  }

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

  static async deleteAllOfUser(email: string): Promise<void> {
    const tokens = await this.findAllByEmail(email);
    const idList = tokens.map((token) => token.tokenId);
    try {
      await Token.destroy({ where: { tokenId: idList } });
    } catch (error) {
      log.error(`Failed to delete all auth tokens of a user!`, error);
    }
  }
}
