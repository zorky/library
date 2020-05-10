import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GestionnaireGuard} from '../common/guards/gestionnaire.guard';
import {BookEditComponent} from './book/book-edit/book-edit.component';
import {AuthorEditComponent} from './author/author-edit/author-edit.component';

const routes: Routes = [
  {
   path: '',
   canLoad: [GestionnaireGuard], canActivate: [GestionnaireGuard],
   children: [
    {path: 'book/edit', component: BookEditComponent},
    {path: 'author/edit', component: AuthorEditComponent}
   ]
 }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionRoutingModule {

}
