export interface Permission {
  id: number;
  role: string;
  resource: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  created_at: string;
  updated_at: string;
}

export type CrudAction = 'create' | 'read' | 'update' | 'delete';
