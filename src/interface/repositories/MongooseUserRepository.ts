import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../application/repositories/IUserRepository";
import UserModel from "../../infrastructure/database/mongoose-models/UserModel";

export class MongooseUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!doc) return null;
    return new User({
      id: doc.id,
      tenantId: doc.tenantId.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      tokenVersion: doc.tokenVersion,
      role: doc.role as any,
      status: doc.status as any,
      createdAt: doc.createdAt,
      isEmailVerified: doc.isEmailVerified,
      emailVerificationCode: doc.emailVerificationCode,
      emailVerificationExpiresAt: doc.emailVerificationExpiresAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return new User({
      id: doc.id,
      tenantId: doc.tenantId.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      tokenVersion: doc.tokenVersion,
      role: doc.role as any,
      status: doc.status as any,
      createdAt: doc.createdAt,
      isEmailVerified: doc.isEmailVerified,
      emailVerificationCode: doc.emailVerificationCode,
      emailVerificationExpiresAt: doc.emailVerificationExpiresAt,
    });
  }

  async save(user: User): Promise<User> {
    const doc = await UserModel.findOneAndUpdate(
      { _id: user.id },
      {
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        tokenVersion: user.tokenVersion,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        emailVerificationCode: user.emailVerificationCode,
        emailVerificationExpiresAt: user.emailVerificationExpiresAt,
      },
      { returnDocument: 'after', upsert: true }
    );
    return user;
  }

  async findAllByTenantId(tenantId: string): Promise<User[]> {
    const docs = await UserModel.find({ tenantId });
    return docs.map(doc => new User({
      id: doc.id,
      tenantId: doc.tenantId.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      tokenVersion: doc.tokenVersion,
      role: doc.role as any,
      status: doc.status as any,
      createdAt: doc.createdAt,
      isEmailVerified: doc.isEmailVerified,
      emailVerificationCode: doc.emailVerificationCode,
      emailVerificationExpiresAt: doc.emailVerificationExpiresAt,
    }));
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
