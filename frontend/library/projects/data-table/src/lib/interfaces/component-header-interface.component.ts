import {BehaviorSubject} from 'rxjs';

/**
 * Interface des components navbar ou ColumnDataTable.headerComponent de la data-table
 */
export interface HeaderComponent {
  /**
   * Data à prendre en compte par le component
   */
  data: any;

  /**
   * pour les valeurs par défaut le cas échéant
   * @type {null}
   */
  dataDefault?: any;

  /**
   * hook déclenché par le component (envoi de données, etc)
   */
  subject: BehaviorSubject<any>;
  // subject: ReplaySubject<any>;
  subject$: any;

  // filterUsed: (name: string, value: any, user: boolean) => void;
  /**
   * Nom du composant, sans espace et caractères spéciaux
   */
  name: string;

  /* Titre du composant */
  title?: string;

  /* Condition utilisée */
  condition?: string;

  /**
   * Ferme-t-on automatiquement le filtre au déclenchement du subject ?
   */
  automaticCloseOnClick?: boolean;
}
