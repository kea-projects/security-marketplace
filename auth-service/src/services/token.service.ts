import chalk from "chalk";
import jwt from "jsonwebtoken";
import { IToken, Token } from "../database/models/token.model";

export class TokenService {
  static async findByToken(token: string): Promise<IToken | null> {
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

  static async deleteByToken(token: string): Promise<void> {
    try {
      await Token.destroy({ where: [{ accessToken: token }, { refreshToken: token }] });
    } catch (error) {
      console.log(new Date().toISOString() + chalk.redBright(` [ERROR] Failed to delete a token pair`, error.stack));
    }
  }

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
