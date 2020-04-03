import {Author} from "../authors/author.model";

export interface Book {
  id: number;
  name: string;
  nb_pages: number;
  enabled: boolean;

  dt_created?: string;
  dt_updated?: string;

  author_obj?: Author;
}
