import { RegisterClient } from "./RegisterClient";
import { IClientRepository } from "../repositories/IClientRepository";
import { Client } from "../../domain/entities/Client";

// Mock manual (In-Memory Repository) para testes super rápidos e isolados
class InMemoryClientRepository implements IClientRepository {
  public clients: Client[] = [];

  async save(client: Client): Promise<Client> {
    const index = this.clients.findIndex((c) => c.id === client.id);
    if (index >= 0) {
      this.clients[index] = client;
    } else {
      this.clients.push(client);
    }
    return client;
  }

  async findById(tenantId: string, id: string): Promise<Client | null> {
    return this.clients.find((c) => c.tenantId === tenantId && c.id === id) || null;
  }

  async findByPhone(tenantId: string, phone: string): Promise<Client | null> {
    return this.clients.find((c) => c.tenantId === tenantId && c.phone === phone) || null;
  }

  async findByName(tenantId: string, name: string): Promise<Client[]> {
    return this.clients.filter((c) => c.tenantId === tenantId && c.name.includes(name));
  }

  async search(tenantId: string, query: string): Promise<Client[]> {
    return this.clients.filter((c) => c.tenantId === tenantId && (c.name.includes(query) || c.phone.includes(query)));
  }

  async update(tenantId: string, id: string, updateData: Partial<Client>): Promise<Client | null> {
    const index = this.clients.findIndex((c) => c.tenantId === tenantId && c.id === id);
    if (index >= 0) {
      Object.assign(this.clients[index], updateData);
      return this.clients[index];
    }
    return null;
  }

  async findAll(tenantId: string): Promise<Client[]> {
    return this.clients.filter((c) => c.tenantId === tenantId);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const initialLength = this.clients.length;
    this.clients = this.clients.filter((c) => !(c.tenantId === tenantId && c.id === id));
    return this.clients.length < initialLength;
  }
}

describe("RegisterClient Use Case", () => {
  let repository: InMemoryClientRepository;
  let registerClient: RegisterClient;

  beforeEach(() => {
    repository = new InMemoryClientRepository();
    registerClient = new RegisterClient(repository);
  });

  it("should create a new client if the phone does not exist in the tenant", async () => {
    const result = await registerClient.execute({
      tenantId: "tenant-1",
      name: "John Doe",
      phone: "11999999999",
      plate: "ABC-1234",
      carModel: "Civic",
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe("John Doe");
    expect(result.phone).toBe("11999999999");
    expect(result.vehicles).toHaveLength(1);
    expect(result.vehicles[0].plate).toBe("ABC-1234");
    expect(result.vehicles[0].carModel).toBe("Civic");

    // Verifica se salvou no repositório
    expect(repository.clients).toHaveLength(1);
    expect(repository.clients[0].id).toBe(result.id);
  });

  it("should update an existing client if the phone already exists", async () => {
    // Preparação: Insere um cliente existente
    const existingClient = new Client({
      tenantId: "tenant-1",
      name: "Old Name",
      phone: "11999999999",
      vehicles: [],
    });
    repository.clients.push(existingClient);

    // Ação: Registra com o mesmo telefone
    const result = await registerClient.execute({
      tenantId: "tenant-1",
      name: "New Name",
      phone: "11999999999",
      plate: "XYZ-9876",
      carModel: "Corolla",
    });

    // Verificação: O ID deve ser o mesmo, mas os dados foram atualizados
    expect(result.id).toBe(existingClient.id);
    expect(result.name).toBe("New Name"); // Nome foi atualizado
    expect(result.vehicles).toHaveLength(1);
    expect(result.vehicles[0].plate).toBe("XYZ-9876");

    // O repositório ainda deve ter apenas 1 cliente
    expect(repository.clients).toHaveLength(1);
  });
});
