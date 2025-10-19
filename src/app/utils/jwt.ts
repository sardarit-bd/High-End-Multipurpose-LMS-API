import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from 'jsonwebtoken'

export const generateToken = (payload: JwtPayload, secret: string, expiresIn: string) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token
};

export const verifyToken = (token: string, secret: string) => {
    const verify = jwt.verify(token, secret)

    return verify
}