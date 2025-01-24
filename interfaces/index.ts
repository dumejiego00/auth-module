import { Strategy } from 'passport';

export interface PassportStrategy {
    name: string;
    strategy: Strategy;
}

export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    is_verified: boolean;
    is_admin:boolean;
  }