export interface FindManyArgs<Entity> {
  where?: Partial<Entity>;
}

export function matchesWhere<Entity extends object>(
  entity: Entity,
  where?: Partial<Entity>,
): boolean {
  if (!where) {
    return true;
  }

  return (Object.keys(where) as Array<keyof Entity>).every(
    (key) => entity[key] === where[key],
  );
}

export abstract class BaseRepository<Entity, CreateInput = Entity> {
  abstract findById(id: string): Promise<Entity | null>;

  abstract findMany(args?: FindManyArgs<Entity>): Promise<Entity[]>;

  abstract create(data: CreateInput): Promise<Entity>;

  abstract update(id: string, data: Partial<Entity>): Promise<Entity>;

  abstract delete(id: string): Promise<Entity>;
}
