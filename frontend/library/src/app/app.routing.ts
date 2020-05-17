import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BooksListComponent} from './components/book/books-list/books-list.component';
import {NotFoundComponent} from './components/not-found/not-found.component';
import {AuthorsListComponent} from './components/author/authors-list/authors-list.component';
import {LoginComponent} from './components/login/login.component';
import {AuthorDtListComponent} from './components/author/author-dt-list/author-dt-list.component';

const appRoutes: Routes = [
  {
    path: '',
    children: [
      {path: '', component: BooksListComponent},
      {path: 'authent', component: LoginComponent},
      {path: 'login', component: LoginComponent},
      {path: 'books', component: BooksListComponent},
      {path: 'authors', component: AuthorsListComponent},
      {path: 'authorsdt', component: AuthorDtListComponent},
      {path: 'gestion', loadChildren: () => import('./gestion/gestion.module').then(m => {
        console.log('loading gestion');
        return m.GestionModule; })}
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
