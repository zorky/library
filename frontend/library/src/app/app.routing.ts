import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BooksListComponent} from './components/book/books-list/books-list.component';
import {BookEditComponent} from './components/book/book-edit/book-edit.component';
import {AuthorEditFormlyComponent} from './components/author/author-edit-formly/author-edit-formly.component';
import {BookEditFormlyComponent} from './components/book/book-edit-formly/book-edit-formly.component';
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {AuthorEditComponent} from "./components/author/author-edit/author-edit.component";
import {AuthorsListComponent} from "./components/author/authors-list/authors-list.component";

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: BooksListComponent},
      {path: 'books', component: BooksListComponent},
      {path: 'book/edit', component: BookEditComponent},
      {path: 'book-formly/edit', component: BookEditFormlyComponent},
      {path: 'authors', component: AuthorsListComponent},
      {path: 'author/edit', component: AuthorEditComponent},
      {path: 'author-formly/edit', component: AuthorEditFormlyComponent}
    ]
  },
  {path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
