import {BehaviorSubject, Observable} from 'rxjs';

/**
 * Interface des components navbar ou ColumnDataTable.headerComponent de la data-table
 */
export interface ColumnComponent {
  /* Nom du composant, sans espace et caractères spéciaux */
  name: string;
  /* colonne concernée dans la data-table dans les ColumnDataTable */
  column: string;
  /* data à prendre en compte par le component */
  data: any;
  /* row courante envoyée par la data-table ("input") TODO : voir si on pt utiliser un type générique T */
  input: any;
  /** hook possiblement déclenché par le component (envoi de données, etc) */
  subject: BehaviorSubject<any>;
  subject$: any;
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
