import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

import {ColumnComponent} from '../../../../../../../projects/data-table/src/lib/interfaces/component-column-interface.component';
import {SubSink} from '../../../../../services/subsink';
import {Author, Book} from '../../../../../services';

@Component({
  selector: 'app-author-select',
  templateUrl: './author-select.component.html',
  styleUrls: ['./author-select.component.css']
})
export class AuthorSelectComponent implements ColumnComponent, OnInit {
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
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.model = {
      id: this.input?.author_obj?.id,
      label: `${this.input?.author_obj?.first_name} ${this.input?.author_obj?.last_name}`};
    console.log(this.model);
    this._initData();
  }
  private _initData() {
    this.form = this.fb.group({ author: [] });
    this.data.filterColumns.forEach((value, key) => {
      // this.authors.push({id: key, first_name: value, last_name: value});
      this.values.push({id: Number(key), label: value});
    });
    console.log(this.values);
    this.form.patchValue({author: this.input?.id});
    // this.author.patchValue(this.input, {emitEvent: true, onlySelf: true});
  }
  compareFn(a1, a2) {
    return a1.id === a2.id;
  }
}
