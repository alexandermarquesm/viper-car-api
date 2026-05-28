import mongoose, { Schema, Document } from "mongoose";

export interface IExpenseDocument extends Document<string> {
  _id: string;
  tenantId: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
}

const expenseSchema = new Schema<IExpenseDocument>({
  _id: { type: String, required: true },
  tenantId: { type: String, ref: "Tenant", required: true, index: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  createdBy: { type: String, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

// Compound index for quick monthly searches per tenant
expenseSchema.index({ tenantId: 1, date: -1 });

export default mongoose.model<IExpenseDocument>("Expense", expenseSchema);
