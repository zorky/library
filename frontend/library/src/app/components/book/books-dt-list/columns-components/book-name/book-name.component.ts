import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ColumnComponent} from '../../../../../../../projects/data-table/src/lib/interfaces/component-column-interface.component';
import {Book} from '../../../../../services';
import {BookDtService} from "../../../../../services/books/book-dt.service";
import {SubSink} from "../../../../../services/subsink";
import {ToastyService} from "../../../../../services/toasty/toasty.service";

@Component({
  selector: 'app-book-name',
  templateUrl: './book-name.component.html',
  styleUrls: ['./book-name.component.scss']
})
export class BookNameComponent implements ColumnComponent, OnInit, OnDestroy {
  column: string;
  data: any;
  input: Book;
  name: string;
  subject: BehaviorSubject<any>;
  subject$: any;
  onEdit = false;
  model: string;
  subSink = new SubSink();
  constructor(private toastySvc: ToastyService,
              private bookSvc: BookDtService) { }

  ngOnInit(): void {
    this.model = this.input?.name;
  }
  goEdit(event) {
    this.model = this.input.name;
    this.onEdit = true;
  }
  cancel(event) {
    this.onEdit = false;
  }
  save(event) {
    const book = this.input;
    book.name = this.model;
    this.subSink.sink = this.bookSvc
      .patch(book)
      .subscribe((b) => {
        this.toastySvc.toasty(
        `Titre bien modifié en "${this.model}"`, `Livre "${this.input.name}"`);
        this.onEdit = false;
      });
  }
  ngOnDestroy(): void {
  }

}
