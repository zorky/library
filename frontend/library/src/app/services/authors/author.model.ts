import {Book} from '..';

export interface Author {
  id: number;
  first_name: string;
  last_name: string;

  books_obj?: Book[];

  dt_created?: string;
  dt_updated?: string;
}
