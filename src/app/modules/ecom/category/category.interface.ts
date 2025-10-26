export interface ICategory {
  name: string;
  slug: string;
  parent?: string;        // ObjectId
  isActive: boolean;
  order?: number;
}
