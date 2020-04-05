import { Component, OnInit } from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormlyFieldConfig} from "@ngx-formly/core";
import {Author} from '../../../services';
@Component({
  selector: 'app-author-edit-formly',
  templateUrl: './author-edit-formly.component.html',
  styleUrls: ['./author-edit-formly.component.css']
})
export class AuthorEditFormlyComponent implements OnInit {
  authorForm = new FormGroup({});
  author: Author = {
    id: 0,
    first_name: '',
    last_name: '',
  };
  authorFields: FormlyFieldConfig[] = [
    {
      key: 'first_name',
      type: 'input', // input type
      templateOptions: {
        type: 'text',
        label: 'Prénom',
        placeholder: 'Entrer le prénom'
      },
      validation: {
        messages: {
          maxLength: 'Le prénom est trop long'
        }
      },
      validators: {
        // limit to 25 characters
        maxLength: ({ value }) => {
          return value.length <= 25;
        }
      }
    },
    {
      key: 'last_name',
      type: 'input', // input type
      templateOptions: {
        type: 'text',
        label: 'Nom',
        placeholder: 'Entrer le nom'
      },
      validation: {
        messages: {
          maxLength: 'Le nom est trop long'
        }
      },
      validators: {
        // limit to 25 characters
        maxLength: ({ value }) => {
          return value.length <= 25;
        }
      }
    },
    // {
    //   key: 'color',
    //   type: 'select',
    //   templateOptions: {
    //     label: 'Outfit color',
    //     options: [
    //       { label: 'Powder blue', value: 'powder-blue' },
    //       { label: 'Orange crush', value: 'orange-crush' },
    //       { label: 'Purple haze', value: 'purple-haze' }
    //     ]
    //   }
    // },
    // {
    //   key: 'quantity',
    //   type: 'input',
    //   templateOptions: {
    //     type: 'number',
    //     label: 'How many outfits?',
    //     placeholder: 'quantity',
    //     required: true
    //   }
    // },
    // {
    //   key: 'size',
    //   type: 'select',
    //   defaultValue: 'M',
    //   templateOptions: {
    //     label: 'Size',
    //     options: [
    //       { label: 'Small', value: 'S' },
    //       { label: 'Medium', value: 'M' },
    //       { label: 'Large', value: 'L' }
    //     ]
    //   }
    // },
    // {
    //   key: 'terms',
    //   type: 'checkbox',
    //   templateOptions: {
    //     label: 'You accept our terms and conditions',
    //     required: true
    //   }
    // }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(authorInfo) {
    console.log(authorInfo);
  }
}
