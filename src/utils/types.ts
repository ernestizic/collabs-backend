import { Request } from 'express';

export type RequestUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  email_verified_at: Date | null;
  createdAt: Date;
  iat: number;
  exp: number;
};

export interface AuthRequest extends Request {
  user: RequestUser;
}
