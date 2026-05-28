import { MongooseExpenseRepository } from "../../../interface/repositories/MongooseExpenseRepository";
import { CreateExpense } from "../../../application/use-cases/CreateExpense";
import { ListExpenses } from "../../../application/use-cases/ListExpenses";
import { DeleteExpense } from "../../../application/use-cases/DeleteExpense";
import { ExpenseController } from "../../../interface/controllers/ExpenseController";

export const makeExpenseController = (): ExpenseController => {
  const expenseRepository = new MongooseExpenseRepository();

  const createExpense = new CreateExpense(expenseRepository);
  const listExpenses = new ListExpenses(expenseRepository);
  const deleteExpense = new DeleteExpense(expenseRepository);

  return new ExpenseController(
    createExpense,
    listExpenses,
    deleteExpense
  );
};
