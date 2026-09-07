import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
  };
}

export interface RequestWithRefreshToken extends Request {
  user: {
    sub: string;
    email: string;
    refreshToken: string;
  };
}
