import { Expense } from "../../domain/entities/Expense";

export interface IExpenseRepository {
  save(expense: Expense): Promise<Expense>;
  findById(tenantId: string, id: string): Promise<Expense | null>;
  findByTenant(tenantId: string, startDate?: Date, endDate?: Date): Promise<Expense[]>;
  delete(tenantId: string, id: string): Promise<boolean>;
}
