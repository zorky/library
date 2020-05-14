import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Book} from '../../../services';

@Component({
  selector: 'app-book-actions',
  templateUrl: './book-actions.component.html',
  styleUrls: ['./book-actions.component.css']
})
export class BookActionsComponent implements OnInit {
  @Input() book: Book;
  @Output() editClick: EventEmitter<Book> = new EventEmitter<Book>();
  @Output() deleteClick: EventEmitter<Book> = new EventEmitter<Book>();
  constructor(private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
  }
  editBook(book: Book) {
    this.editClick.emit(book);
  }
  deleteBook(book: Book) {
    this.deleteClick.emit(book);
  }
}
