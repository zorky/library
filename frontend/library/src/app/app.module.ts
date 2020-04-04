import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from './modules/material.module';
import { BooksListComponent } from './components/book/books-list/books-list.component';
import { AuthorDisplayComponent } from './components/author/author-display/author-display.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthorEditComponent } from './components/author/author-edit/author-edit.component';
import { BookEditComponent } from './components/book/book-edit/book-edit.component';
import {AppRoutingModule} from "./app.routing";

@NgModule({
  declarations: [
    AppComponent,
    BooksListComponent,
    AuthorDisplayComponent,
    HeaderComponent,
    FooterComponent,
    AuthorEditComponent,
    BookEditComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
