import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-author-edit',
  templateUrl: './author-edit.component.html',
  styleUrls: ['./author-edit.component.css']
})
export class AuthorEditComponent implements OnInit {
  authorForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this._initForm();
  }

  private _initForm() {
    this.authorForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }
}
