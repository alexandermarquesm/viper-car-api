import { IExpenseRepository } from "../repositories/IExpenseRepository";

export interface DeleteExpenseInput {
  tenantId: string;
  id: string;
}

export class DeleteExpense {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(input: DeleteExpenseInput) {
    // 1. Verify existence and ownership
    const expense = await this.expenseRepository.findById(input.tenantId, input.id);
    if (!expense) {
      throw new Error("Despesa não encontrada");
    }

    if (expense.tenantId !== input.tenantId) {
      throw new Error("Não autorizado");
    }

    // 2. Perform deletion
    return await this.expenseRepository.delete(input.tenantId, input.id);
  }
}
