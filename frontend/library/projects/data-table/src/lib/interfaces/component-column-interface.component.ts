import {BehaviorSubject} from 'rxjs';

/**
 * Interface des components navbar ou ColumnDataTable.headerComponent de la data-table
 */
export interface ColumnComponent {
  column: string;
  /* data à prendre en compte par le component */
  data: any;
  /* pour les valeurs par défaut le cas échéant ("input") */
  input: any;
  /* hook déclenché par le component (envoi de données, etc) */
  subject: BehaviorSubject<any>;
  subject$: any;
  /* Nom du composant, sans espace et caractères spéciaux */
  name: string;
  /* Titre du composant */
  title?: string;
}

// export interface ColumnComponent<T> {
//   /* data à prendre en compte par le component */
//   data: any;
//   /* pour les valeurs par défaut le cas échéant ("input") */
//   input?: T;
//   /* hook déclenché par le component (envoi de données, etc) */
//   subject: BehaviorSubject<any>;
//   subject$: any;
//   /* Nom du composant, sans espace et caractères spéciaux */
//   name: string;
//   /* Titre du composant */
//   title?: string;
// }
