export interface FindManyArgs<Entity> {
  where?: Partial<Entity>;
}

export abstract class BaseRepository<Entity, CreateInput = Entity> {
  abstract findById(id: string): Promise<Entity | null>;

  abstract findMany(args?: FindManyArgs<Entity>): Promise<Entity[]>;

  abstract create(data: CreateInput): Promise<Entity>;

  abstract update(id: string, data: Partial<Entity>): Promise<Entity>;

  abstract delete(id: string): Promise<Entity>;
}
