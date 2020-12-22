import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {ToastyService} from '../../../../../services/toasty/toasty.service';
import {BookDtService} from '../../../../../services/books/book-dt.service';
import {Book} from '../../../../../services';
import {SubSink} from '../../../../../services/subsink';
import {ColumnComponent} from 'data-table';

@Component({
  selector: 'app-book-enabled',
  templateUrl: './book-enabled.component.html',
  styleUrls: ['./book-enabled.component.css']
})
export class BookEnabledComponent implements ColumnComponent, OnInit, OnDestroy {
  column: string;
  data: any;
  input: Book;
  name: string;
  subject: BehaviorSubject<any>;
  subject$: any;
  model: boolean;
  subSink = new SubSink();
  constructor(private toastySvc: ToastyService,
              private bookSvc: BookDtService) { }

  ngOnInit(): void {
    this.model = this.input?.enabled;
  }
  onChanged(event: MatCheckboxChange) {
    console.log(event);
    const book = this.input;
    book.enabled = event.checked;
    this.subSink.sink = this.bookSvc
      .patch(book)
      .subscribe((data) => this.toastySvc.toasty(
          `Livre ${event.checked ? 'disponible' : 'indisponible'}`,
          `Livre "${this.input.name}"`));
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
