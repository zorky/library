import {ErrorHandler, Injector, LOCALE_ID, NgModule} from '@angular/core';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BooksListComponent } from './components/book/books-list/books-list.component';
import { AuthorDisplayComponent } from './components/author/author-display/author-display.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import {AppRoutingModule} from './app.routing';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AuthorsListComponent } from './components/author/authors-list/authors-list.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {SafeHtmlPipe} from "./pipes/safe-html";
import {MatPaginatorIntl} from "@angular/material/paginator";
import {getFrenchPaginatorIntl} from "./common/paginator.french";
import {LoginComponent} from "./components/login/login.component";
import { BookSearchComponent } from './components/book/book-search/book-search.component';
import {CommonModule, registerLocaleData} from "@angular/common";

import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
// import HandlerError from './common/errors/error-handler';
import {AppInjector} from './common/injector';
import {CommonLibraryModule} from './common/common-library.module';
import {HttpClientModule} from "@angular/common/http";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {JwtModule} from "@auth0/angular-jwt";
import {MaterialModule} from "./modules/material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@angular/flex-layout";
import { BookActionsComponent } from './components/book/book-actions/book-actions.component';
import {DataTableModule} from "../../projects/data-table/src/lib/data-table.module";
import { AuthorDtListComponent } from './components/author/author-dt-list/author-dt-list.component';
import { AuthorFilterDtComponent } from './components/author/author-dt-list/filters/author-filter-dt/author-filter-dt.component';
import { BooksFilterDtComponent } from './components/author/author-dt-list/filters/books-filter-dt/books-filter-dt.component';
import {BooksListColumnComponent} from "./components/author/author-dt-list/columns-components/books-list/books-list.component";
import { BooksDtListComponent } from './components/book/books-dt-list/books-dt-list.component';
import { AuthorSelectComponent } from './components/book/books-dt-list/columns-components/author-select/author-select.component';
import { BookEnabledComponent } from './components/book/books-dt-list/columns-components/book-enabled/book-enabled.component';

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

export function tokenGetter(): string {
  const token = localStorage.getItem('token');
  // console.log(token);
  return token;
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,

    BooksListComponent,
    AuthorDisplayComponent,
    HeaderComponent,
    FooterComponent,

    NotFoundComponent,
    AuthorsListComponent,

    ConfirmationDialogComponent,
    SafeHtmlPipe,
    BookSearchComponent,
    BookActionsComponent,
    AuthorDtListComponent,
    BooksFilterDtComponent,
    BooksListColumnComponent,
    BooksDtListComponent,
    AuthorSelectComponent,
    BookEnabledComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    JwtModule.forRoot({
      config: {
        tokenGetter,
        whitelistedDomains: [
          'localhost:4200', 'plateform',
          // environment.host
        ],
        blacklistedRoutes: [],
        skipWhenExpired: true,
        // throwNoTokenError: true
      }
    }),
    CommonLibraryModule,
    MaterialModule,

    DataTableModule,

    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getFrenchPaginatorIntl() },
    { provide: LOCALE_ID, useValue: 'fr-FR'},
    // { provide: ErrorHandler, useValue: HandlerError}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector){
    AppInjector.setInjector(injector);
  }
}
