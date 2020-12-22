import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';
import {SubSink} from '../../../../../services/subsink';
import {Author, Book} from '../../../../../services';

import {BookDtService} from '../../../../../services/books/book-dt.service';
import {ToastyService} from '../../../../../services/toasty/toasty.service';
import {ColumnComponent} from 'data-table';

@Component({
  selector: 'app-author-select',
  templateUrl: './author-select.component.html',
  styleUrls: ['./author-select.component.css']
})
export class AuthorSelectComponent implements ColumnComponent, OnInit, OnDestroy {
  column: string;
  data: any;
  name: string;
  subject: BehaviorSubject<any>;
  subject$: any;
  selectedValue = '';
  input: Book;
  values: any[] = [];
  authors: Author[] = [];
  form: FormGroup;
  author = new FormControl();
  model: any;
  subSink = new SubSink();
  constructor(private fb: FormBuilder,
              private toastySvc: ToastyService,
              private bookSvc: BookDtService) { }

  ngOnInit(): void {
    this.model = {
      id: this.input?.author_obj?.id,
      label: `${this.input?.author_obj?.first_name} ${this.input?.author_obj?.last_name}`};
    this._initData();
  }
  private _initData() {
    this.form = this.fb.group({ author: [] });
    const values = [{id: null, label: '--'}];
    this.data.filterColumns.forEach((value, key) => {
      values.push({id: Number(key), label: value});
    });
    this.values = values;
    this.form.patchValue({author: this.input?.id});
  }
  compareFn(a1, a2) {
    return a1?.id === a2?.id;
  }
  onSelected(event: MatSelectChange) {
    const book = this.input;
    book.author = event.value.id;
    this.subSink.sink = this.bookSvc.patch(book).subscribe((data) => {
      this.toastySvc.toasty(
        `L'auteur "${event.value.label}" a bien été mis à jour`,
        `Livre "${this.input.name}"`);
    });
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
