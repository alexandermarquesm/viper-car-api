import mongoose, { Schema, Document } from "mongoose";

export interface IInviteDocument extends Document {
  email: string;
  tenantId: string;
  tenantName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
    tenantName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevenir múltiplos convites pendentes do mesmo tenant para o mesmo email
InviteSchema.index({ email: 1, tenantId: 1, status: 1 });

export default mongoose.models.Invite || mongoose.model<IInviteDocument>("Invite", InviteSchema);
