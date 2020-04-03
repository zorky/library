import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubSink} from '../../services/subsink';

import {finalize} from "rxjs/operators";
import {Book, BookService} from "../../services";

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit, OnDestroy {
  subSink = new SubSink();
  books: Book[];
  loading = false;

  constructor(private bookSvc: BookService) { }

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

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
