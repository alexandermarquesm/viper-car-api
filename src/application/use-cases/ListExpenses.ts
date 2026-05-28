import { IExpenseRepository } from "../repositories/IExpenseRepository";

export interface ListExpensesInput {
  tenantId: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export class ListExpenses {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(input: ListExpensesInput) {
    const start = input.startDate ? new Date(input.startDate) : undefined;
    const end = input.endDate ? new Date(input.endDate) : undefined;

    return await this.expenseRepository.findByTenant(input.tenantId, start, end);
  }
}
