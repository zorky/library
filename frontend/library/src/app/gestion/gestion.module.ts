import { NgModule } from '@angular/core';
import {GestionRoutingModule} from './gestion-routing.module';
import {AuthorEditComponent} from './author/author-edit/author-edit.component';
import {AuthorContainerComponent} from './author/author-container/author-container.component';
import {BookEditComponent} from './book/book-edit/book-edit.component';
import {CommonLibraryModule} from '../common/common-library.module';
import {MaterialModule} from '../modules/material.module';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
  declarations: [
    AuthorContainerComponent,
    AuthorEditComponent,
    BookEditComponent
  ],
  exports: [
    AuthorContainerComponent,
    AuthorEditComponent,
    BookEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    CommonLibraryModule,
    MaterialModule,
    GestionRoutingModule,
  ]
})
export class GestionModule { }
