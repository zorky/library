import { Component, OnInit } from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Author, AuthorService, Book} from '../../../services';
import {FormlyFieldConfig} from "@ngx-formly/core";
import {map} from "rxjs/operators";
import {Pagination} from "../../../services/base/pagination.model";

@Component({
  selector: 'app-book-edit-formly',
  templateUrl: './book-edit-formly.component.html',
  styleUrls: ['./book-edit-formly.component.css']
})
export class BookEditFormlyComponent implements OnInit {
  bookForm = new FormGroup({});
  book: Book = {
    id: 0,
    name: '',
    nb_pages: 0,
    enabled: true,
    author: null
  };
  bookFields: FormlyFieldConfig[] = [
    {
      key: 'name',
      type: 'input', // input type
      templateOptions: {
        type: 'text',
        label: 'Titre',
        placeholder: 'Entrer le titre',
        required: true,
      },
      validation: {
        messages: {
          maxLength: 'Le titre est trop long'
        }
      },
      validators: {
        // limit to 25 characters
        maxLength: ({ value }) => {
          return value.length <= 100;
        }
      }
    },
    {
      key: 'nb_pages',
      type: 'input', // input type
      templateOptions: {
        type: 'number',
        label: 'Nombre de pages',
        min: 1,
        placeholder: 'Entrer le nombre de pages',
        required: true
      },
      validation: {
        messages: {
          min: 'Doit être supérieur à 0'
        }
      },
      // validators: {
      //   maxLength: ({ value }) => {
      //     return value > 0;
      //   }
      // }
    },
    {
      key: 'enabled',
      type: 'checkbox',
      templateOptions: {
        label: 'Disponible',
        required: true
      }
    },
    {
      key: 'author',
      type: 'select',
      defaultValue: null,
      templateOptions: {
        label: 'Auteur',
        required: true,
        options: this.authorSvc
          .fetchAll()
          .pipe(map((values: Pagination<Author>, index: number) => {
            return values.list.map((author: Author) => {
              return {value: author.id, label: `${author.first_name} ${author.last_name}` };
            });
        }))
      }
    },
  ];
  constructor(private authorSvc: AuthorService) { }

  ngOnInit(): void {

  }

  onSubmit(bookInfo) {
    console.log(bookInfo);
  }
}
