import {Book} from '../books/book.model';

export interface Loan {
  id: number;
  user: number;
  book: number;
  user_obj?: any;
  book_obj?: Book;
  in_progress: boolean;
  date_loan: string;
  date_return: string;
  dt_created?: string;
  dt_updated?: string;
}
