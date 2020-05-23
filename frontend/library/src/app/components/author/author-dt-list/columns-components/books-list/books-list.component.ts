import {AfterViewInit, Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

import {ColumnComponent} from '../../../../../../../projects/data-table/src/lib/interfaces/component-column-interface.component';
import {SubSink} from '../../../../../services/subsink';
import {Book} from '../../../../../services';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListColumnComponent implements ColumnComponent, OnInit, AfterViewInit, OnChanges {
  column: string;
  data: any;
  name: string;
  input: any;
  subject: BehaviorSubject<any>;
  subject$: any;
  selectedValue = '';
  values: any[] = [];
  subSink = new SubSink();
  books = new FormControl();
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this._initData();
  }
  private _initData() {
    this.data.filterColumns.forEach((value, key) => {
      this.values.push({id: key, label: value});
    });
    if (this.input?.books_obj) {
      console.log(this.input.books_obj);
      this.books.setValue(this.input?.books_obj);
    }
    // this.bookForm = this.fb.group({ books: [] });
    // this.bookForm.get('books')
    //   .valueChanges.subscribe((data) => {
    //     // console.log(data);
    // });
    // if (this.input.books_obj) {
    //   console.log(this.column);
    //   console.log(this.input.books_obj);
    //   this.bookForm.patchValue(
    //     {books: this.input?.books_obj.map((book) => Number(book.id))});
    //   // this.bookForm.patchValue({books: this.input.books_obj});
    // }
  }
  compareFn(book1: Book, book2: Book) {
    return book1 && book2 ? book1.id === book2.id : false;
  }
  ngAfterViewInit(): void {
    // this._initData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }
}
