import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BooksListComponent} from './components/book/books-list/books-list.component';
import {BookEditComponent} from './components/book/book-edit/book-edit.component';
import {AuthorEditFormlyComponent} from './components/author/author-edit-formly/author-edit-formly.component';
import {BookEditFormlyComponent} from './components/book/book-edit-formly/book-edit-formly.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: BooksListComponent},
      {path: 'book/edit', component: BookEditComponent},
      {path: 'book-formly/edit', component: BookEditFormlyComponent},
      {path: 'author-formly/edit', component: AuthorEditFormlyComponent}
    ]
  },
  // {path: 'forbidden', component: PermissionDeniedComponent, canActivate: [ForbiddenGuard], runGuardsAndResolvers: 'always'},
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
