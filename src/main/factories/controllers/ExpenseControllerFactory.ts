import { MongooseExpenseRepository } from "../../../interface/repositories/MongooseExpenseRepository";
import { CreateExpense } from "../../../application/use-cases/CreateExpense";
import { ListExpenses } from "../../../application/use-cases/ListExpenses";
import { DeleteExpense } from "../../../application/use-cases/DeleteExpense";
import { UpdateExpense } from "../../../application/use-cases/UpdateExpense";
import { ExpenseController } from "../../../interface/controllers/ExpenseController";

export const makeExpenseController = (): ExpenseController => {
  const expenseRepository = new MongooseExpenseRepository();

  const createExpense = new CreateExpense(expenseRepository);
  const listExpenses = new ListExpenses(expenseRepository);
  const deleteExpense = new DeleteExpense(expenseRepository);
  const updateExpense = new UpdateExpense(expenseRepository);

  return new ExpenseController(
    createExpense,
    listExpenses,
    deleteExpense,
    updateExpense
  );
};
