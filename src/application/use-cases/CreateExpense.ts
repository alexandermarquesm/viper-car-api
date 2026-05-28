import { Expense, ExpenseCategory } from "../../domain/entities/Expense";
import { IExpenseRepository } from "../repositories/IExpenseRepository";

export interface CreateExpenseInput {
  tenantId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string | Date;
  createdBy: string;
}

export class CreateExpense {
  constructor(private expenseRepository: IExpenseRepository) {}

  async execute(input: CreateExpenseInput) {
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

    const expense = new Expense({
      tenantId: input.tenantId,
      description: input.description.trim(),
      amount: input.amount,
      category: input.category,
      date: expenseDate,
      createdBy: input.createdBy,
    });

    return await this.expenseRepository.save(expense);
  }
}
