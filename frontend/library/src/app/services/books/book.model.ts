import {Author} from '..';

export interface Book {
  id: number;
  name: string;
  nb_pages: number;
  enabled: boolean;
  author: number;
  author_obj?: Author;
  dt_created?: string;
  dt_updated?: string;
}
