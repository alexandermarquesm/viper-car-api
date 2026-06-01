import crypto from "crypto";

export interface IUserProps {
  id?: string;
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string; // The hashed password, NOT plaintext
  tokenVersion?: number;
  role?: "owner" | "admin" | "worker";
  status?: "active" | "inactive" | "pending";
  createdAt?: Date;
  isEmailVerified?: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiresAt?: Date;
}

export class User {
  public readonly id: string;
  public tenantId: string;
  public name: string;
  public email: string;
  public passwordHash: string;
  public tokenVersion: number;
  public role: "owner" | "admin" | "worker";
  public status: "active" | "inactive" | "pending";
  public readonly createdAt: Date;
  public isEmailVerified: boolean;
  public emailVerificationCode?: string;
  public emailVerificationExpiresAt?: Date;

  constructor(props: IUserProps) {
    this.id = props.id || crypto.randomUUID();
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.email = props.email.toLowerCase().trim();
    this.passwordHash = props.passwordHash;
    this.tokenVersion = props.tokenVersion || 0;
    this.role = props.role || "worker";
    this.status = props.status || "active";
    this.createdAt = props.createdAt || new Date();
    this.isEmailVerified = props.isEmailVerified !== undefined ? props.isEmailVerified : false;
    this.emailVerificationCode = props.emailVerificationCode;
    this.emailVerificationExpiresAt = props.emailVerificationExpiresAt;
  }
}
