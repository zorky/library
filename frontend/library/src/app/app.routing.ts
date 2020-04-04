import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BooksListComponent} from './components/book/books-list/books-list.component';
import {BookEditComponent} from './components/book/book-edit/book-edit.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: BooksListComponent},
      {path: 'book/edit', component: BookEditComponent}
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
