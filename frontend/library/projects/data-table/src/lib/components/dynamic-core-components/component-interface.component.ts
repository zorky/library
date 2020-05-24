import {BehaviorSubject} from 'rxjs';

/**
 * Interface des components navbar ou ColumnDataTable.headerComponent de la data-table
 */
export interface DynamicComponent {
  /**
   * Data à prendre en compte par le component
   */
  data: any;

  /**
   * hook déclenché par le component (envoi de données, etc)
   */
  subject: BehaviorSubject<any>;

  /**
   * Nom du composant
   */
  name?: string;
}
