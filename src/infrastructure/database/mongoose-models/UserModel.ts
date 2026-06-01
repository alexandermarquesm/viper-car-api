import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document<string> {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string;
  tokenVersion: number;
  role: "owner" | "admin" | "worker";
  status: "active" | "inactive" | "pending";
  createdAt: Date;
  isEmailVerified: boolean;
  emailVerificationCode?: string;
  emailVerificationExpiresAt?: Date;
}

const userSchema = new Schema<IUserDocument>({
  _id: { type: String, required: true },
  tenantId: { type: String, ref: "Tenant", required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  tokenVersion: { type: Number, default: 0 },
  role: { type: String, default: "worker" },
  status: { type: String, default: "active", index: true },
  createdAt: { type: Date, default: Date.now },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: { type: String, index: { sparse: true } },
  emailVerificationExpiresAt: { type: Date },
});

export default mongoose.model<IUserDocument>("User", userSchema);
