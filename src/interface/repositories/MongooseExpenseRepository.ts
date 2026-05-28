import { Expense, ExpenseCategory } from "../../domain/entities/Expense";
import { IExpenseRepository } from "../../application/repositories/IExpenseRepository";
import ExpenseModel from "../../infrastructure/database/mongoose-models/ExpenseModel";

export class MongooseExpenseRepository implements IExpenseRepository {
  async save(expense: Expense): Promise<Expense> {
    const data = {
      tenantId: expense.tenantId,
      _id: expense.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      createdBy: expense.createdBy,
      createdAt: expense.createdAt,
    };

    const doc = await ExpenseModel.findOneAndUpdate(
      { tenantId: expense.tenantId, _id: expense.id },
      { $set: data },
      { upsert: true, returnDocument: 'after' },
    );

    return this._mapToEntity(doc);
  }

  async findById(tenantId: string, id: string): Promise<Expense | null> {
    const doc = await ExpenseModel.findOne({ tenantId, _id: id });
    return doc ? this._mapToEntity(doc) : null;
  }

  async findByTenant(tenantId: string, startDate?: Date, endDate?: Date): Promise<Expense[]> {
    const query: any = { tenantId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const docs = await ExpenseModel.find(query).sort({ date: -1 });
    return docs.map((doc) => this._mapToEntity(doc));
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const result = await ExpenseModel.deleteOne({ tenantId, _id: id });
    return result.deletedCount > 0;
  }

  private _mapToEntity(doc: any): Expense {
    return new Expense({
      id: doc._id,
      tenantId: doc.tenantId.toString(),
      description: doc.description,
      amount: doc.amount,
      category: doc.category as ExpenseCategory,
      date: doc.date,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt,
    });
  }
}
