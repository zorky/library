import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';

import {GestionRoutingModule} from './gestion-routing.module';
import {AuthorEditComponent} from './author/author-edit/author-edit.component';
import {AuthorContainerComponent} from './author/author-container/author-container.component';
import {BookEditComponent} from './book/book-edit/book-edit.component';
import {CommonLibraryModule} from '../common/common-library.module';
import {MaterialModule} from '../modules/material.module';
import {AuthorFilterDtComponent} from '../components/author/author-dt-list/filters/author-filter-dt/author-filter-dt.component';

@NgModule({
  declarations: [
    AuthorContainerComponent,
    AuthorEditComponent,
    BookEditComponent,
    AuthorFilterDtComponent
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
