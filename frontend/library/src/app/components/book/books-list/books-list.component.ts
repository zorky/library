import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs/operators';

import {SubSink} from '../../../services/subsink';
import {Book, BookService} from '../../../services';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit, OnDestroy {
  subSink = new SubSink();
  books: Book[];
  loading = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private bookSvc: BookService) { }

  ngOnInit(): void {
  }

  fetchBooks(event) {
    this.loading = true;
    this.books = [];
    this.subSink.sink = this.bookSvc
      .fetchAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe((books) => {
        console.log(books);
        this.books = books;
      });
  }

  editBook(book: Book) {
    this.router.navigate(['/book/edit', {id: book.id}], {relativeTo: this.route.parent});
  }

  addBook() {
    this.router.navigate(['/book/edit', {id: 0}], {relativeTo: this.route.parent});
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
