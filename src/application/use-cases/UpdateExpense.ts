import { ExpenseCategory } from "../../domain/entities/Expense";
import { IExpenseRepository } from "../repositories/IExpenseRepository";

export interface UpdateExpenseInput {
  id: string;
  tenantId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string | Date;
}

export class UpdateExpense {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(input: UpdateExpenseInput) {
    const expense = await this.expenseRepository.findById(input.tenantId, input.id);
    if (!expense) {
      throw new Error("Despesa não encontrada");
    }

    if (!input.description || input.description.trim().length === 0) {
      throw new Error("A descrição da despesa é obrigatória");
    }

    if (input.amount <= 0) {
      throw new Error("O valor da despesa deve ser maior que zero");
    }

    const categories: ExpenseCategory[] = ["supplies", "rent", "utilities", "salary", "marketing", "other"];
    if (!categories.includes(input.category)) {
      throw new Error("Categoria de despesa inválida");
    }

    const expenseDate = input.date ? new Date(input.date) : new Date();

    expense.description = input.description.trim();
    expense.amount = input.amount;
    expense.category = input.category;
    expense.date = expenseDate;

    return await this.expenseRepository.save(expense);
  }
}
