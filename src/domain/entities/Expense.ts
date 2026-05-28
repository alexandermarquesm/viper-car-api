import crypto from "crypto";

export type ExpenseCategory = "supplies" | "rent" | "utilities" | "salary" | "marketing" | "other";

export interface IExpenseProps {
  id?: string;
  tenantId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  createdBy: string;
  createdAt?: Date;
}

export class Expense {
  public readonly id: string;
  public tenantId: string;
  public description: string;
  public amount: number;
  public category: ExpenseCategory;
  public date: Date;
  public createdBy: string;
  public readonly createdAt: Date;

  constructor(props: IExpenseProps) {
    this.id = props.id || crypto.randomUUID();
    this.tenantId = props.tenantId;
    this.description = props.description;
    this.amount = props.amount;
    this.category = props.category;
    this.date = props.date || new Date();
    this.createdBy = props.createdBy;
    this.createdAt = props.createdAt || new Date();
  }
}
