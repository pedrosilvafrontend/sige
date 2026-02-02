export interface CRUD<T> {
  create: T;
  read: T;
  update: T;
  delete: T;
}
