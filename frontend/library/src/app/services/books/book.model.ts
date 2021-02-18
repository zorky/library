import {Author} from '..';
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
  dt_created?: string;
  dt_updated?: string;
}
