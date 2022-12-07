import chalk from "chalk";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { IToken, Token } from "../database/models/token.model";

export class TokenService {
  static async findByToken(token: string): Promise<IToken | null> {
    // TODO - think about why [Op.or]: is not used
    return Token.findOne({ where: [{ accessToken: token }, { refreshToken: token }] });
  }

  static async findAllByUsername(username: string): Promise<IToken[]> {
    const tokens = await Token.findAll();
    const filteredTokens = tokens.filter((token) => {
      jwt.decode(token.refreshToken)?.sub === username;
    });
    return filteredTokens;
  }

  static async createToken(token: IToken): Promise<IToken | null> {
    try {
      return Token.create({ ...token });
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to create a token`, error.stack));
      return null;
    }
  }

  static async deleteByToken(token: string): Promise<boolean> {
    try {
      const result = await Token.destroy({ where: { [Op.or]: [{ accessToken: token }, { refreshToken: token }] } });
      if (result == 0) {
        console.log(
          new Date().toISOString() + chalk.yellowBright(` [WARN] No tokens were removed when deleteByToken was called!`)
        );
      }
      return result > 0;
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to delete a token pair`, error.stack));
    }
    return false;
  }

  // TODO - discuss potential functionality of deleting all tokens if someone tries to authenticate with an invalid token of that user
  static async deleteAllOfUser(username: string): Promise<void> {
    const tokens = await this.findAllByUsername(username);
    const idList = tokens.map((token) => token.tokenId);
    try {
      await Token.destroy({ where: { tokenId: idList } });
    } catch (error) {
      console.log(
        new Date().toISOString() + chalk.redBright(` [ERROR] Failed to delete all auth tokens of a user`, error.stack)
      );
    }
  }
}
