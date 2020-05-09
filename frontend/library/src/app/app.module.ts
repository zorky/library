import { BrowserModule } from '@angular/platform-browser';
import {ErrorHandler, Injector, LOCALE_ID, NgModule} from '@angular/core';

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
import {AppRoutingModule} from './app.routing';
import { AuthorEditFormlyComponent } from './components/author/author-edit-formly/author-edit-formly.component';
import { BookEditFormlyComponent } from './components/book/book-edit-formly/book-edit-formly.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthorsListComponent } from './components/author/authors-list/authors-list.component';
import {FormlyModule} from '@ngx-formly/core';
import {FormlyMaterialModule} from '@ngx-formly/material';
import {FormlyMatDatepickerModule} from "@ngx-formly/material/datepicker";
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {SafeHtmlPipe} from "./pipes/safe-html";
import { AuthorContainerComponent } from './components/author/author-container/author-container.component';
import {MatPaginatorIntl} from "@angular/material/paginator";
import {getFrenchPaginatorIntl} from "./common/paginator.french";
import {JwtModule} from "@auth0/angular-jwt";
import {LoginComponent} from "./components/login/login.component";
import { BookSearchComponent } from './components/book/book-search/book-search.component';
import {registerLocaleData} from "@angular/common";
// import {FormlyMatToggleModule} from "@ngx-formly/material/toggle";

import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import HandlerError from './common/errors/error-handler';
import {AppInjector} from './common/injector';

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

export function tokenGetter(): string {
  return localStorage.getItem('token');
}

// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,

    BooksListComponent,
    AuthorDisplayComponent,
    HeaderComponent,
    FooterComponent,
    AuthorEditComponent,
    BookEditComponent,
    AuthorEditFormlyComponent,
    BookEditFormlyComponent,
    NotFoundComponent,
    AuthorsListComponent,

    ConfirmationDialogComponent,
    SafeHtmlPipe,
    AuthorContainerComponent,
    BookSearchComponent
  ],
  imports: [
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        whitelistedDomains: [
          'localhost:4200',
          // environment.host
        ],
        blacklistedRoutes: [],
        skipWhenExpired: true,
        // throwNoTokenError: true
      }
    }),
    BrowserModule,
    BrowserAnimationsModule,

    FormsModule,
    ReactiveFormsModule,

    MaterialModule,
    AppRoutingModule,

    FormlyMatDatepickerModule,
    // FormlyMatToggleModule,
    FormlyModule.forRoot(),
    FormlyMaterialModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getFrenchPaginatorIntl() },
    { provide: LOCALE_ID, useValue: 'fr-FR'},
    { provide: ErrorHandler, useValue: HandlerError}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector){
    AppInjector.setInjector(injector);
  }
}
