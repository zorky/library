import {Author, Loan} from '..';
import {User} from '../authent/user.model';

export interface Book {
  id: number;
  name: string;
  nb_pages: number;
  enabled: boolean;
  author: number;
  author_obj?: Author;
  borrowers_obj?: User[];
  borrowers?: number[];
  loans?: number[];
  loans_obj?: Loan[];
  picture?: string;
  dt_created?: string;
  dt_updated?: string;
}
