import { Collection, Db } from 'mongodb';
import { Token } from 'simple-oauth2';
import * as crypto from "crypto";

export default class Mongo {

  auth: AuthMongo;

  constructor(readonly db: Db) {
    this.auth = new AuthMongo(this.db.collection('authentication'));
  }
}

export type AuthId = string;

export class AuthMongo {

  private idSize = 32;

  constructor(readonly coll: Collection) { }

  get = (id: AuthId): Promise<Token | null> => this.coll.findOne({ _id: id });

  save = async (token: Token, username: string): Promise<AuthId> => {
    const id = crypto.randomBytes(this.idSize).toString('base64').slice(0, this.idSize);
    await this.coll.insertOne({
      ...token,
      _id: id,
      username
    });
    return id;
  }
}
