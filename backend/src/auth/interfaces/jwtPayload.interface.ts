import { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadInterface extends JwtPayload {
  name: string;
  email: string;
  jti: string;
}
