import {Injectable, Type} from '@angular/core';
import {ColumnDataTable} from '../interfaces/data-table-column';
import {HeaderComponent} from '../interfaces/component-header-interface.component';
import {ColumnComponentItem, ComponentItem} from '../components/dynamic-core-components/component-item';
import {ColumnComponent} from '../interfaces/component-column-interface.component';

/**
 * Helper data-table
 * - de création d'un component pour les entêtes data-table
 * - ajout / suppression field operateur multi valuées
 */
@Injectable({ providedIn: 'root' })
export class DataTableHeaderColumnComponentService {
  constructor() {}

  /**
   * Création component helper de filtre colonne
   */
  createHeaderComponent<T>(columns: ColumnDataTable[],
                           column: string,
                           nameComponent: string = column,
                           titleComponent: string = column,
                           componentType: Type<HeaderComponent>,
                           data: any,
                           autoClose: boolean = false,
                           dataDefault: any = null) {
    const colDesc = columns.find((col: ColumnDataTable) => col.column ===  column);
    if (colDesc) {
      const filterComponent = new ComponentItem(componentType, data, nameComponent);
      filterComponent.dataDefault = dataDefault;
      filterComponent.automaticCloseOnClick = autoClose;
      filterComponent.name = nameComponent;
      filterComponent.title = titleComponent;
      colDesc.headerComponent = () => filterComponent;
      return filterComponent;
    }
    return null;
  }

  /**
   * Création component helper de colonne
   */
  createColumnComponent<T>(columns: ColumnDataTable[],
                           column: string,
                           nameComponent: string = column,
                           titleComponent: string = column,
                           componentType: Type<ColumnComponent>,
                           data: any) {
    const colDesc = columns.find((col: ColumnDataTable) => col.column ===  column);
    if (colDesc) {
      const columnComponent = new ColumnComponentItem(componentType, data);
      columnComponent.name = nameComponent;
      // columnComponent.title = titleComponent;
      columnComponent.data = data;
      colDesc.columnComponent = () => columnComponent;
      return columnComponent;
    }
    return null;
  }

  /**
   * Test de l'existance d'une valeur dans values
   * @param fieldName champ à tester
   * @param values dans ces values
   */
  private isFieldExists(fieldName: string, values: string[]) {
    let found = -1;

    values.forEach((v, idx) => {
      const isFound = v.indexOf(fieldName);
      if (isFound !== -1) {
        found = idx;
        return;
      }
    });

    return found;
  }

  /**
   * Ajout operateur pour extraDict (clé multi valeurs)
   * @param key clé, par exemple field_operator
   * @param value : valeur du field_operator, par exemple `cod_ind||number||eq||50`
   * @param fieldName : le champ à filtrer dans field_operator, par exemple cod_ind
   * @param extraDict : le Map<> utilisé pour app-data-table
   * @param fieldNamesFilters : on garde en mémoire les champs utilisés dans key
   * @param removeFieldName doit on retirer le champ fieldName des valeurs ?
   */
  public addOperatorsUrlQS(key: string, value: string, fieldName: string,
                           extraDict: Map<string, string[]> = new Map<string, string[]>(),
                           fieldNamesFilters: Map<string, string> = new Map<string, string>(),
                           removeFieldName = true) {
    let values = [];

    // console.log('fieldName ', fieldName);

    if (extraDict.has(key)) {
      values = extraDict.get(key); // [values]
      if (values && values.length > 0 && removeFieldName) {
        const isFound = this.isFieldExists(fieldName, values);
        if (isFound !== -1) {
          values.splice(isFound, 1);
        }
      }
    }

    values.push(value);
    extraDict.set(key, values);

    fieldNamesFilters.set(fieldName, value);
  }

  /**
   * Suppression filtre multi valeurs
   * @param {string} key : clé du paramétre multi valué, par exemple field_operator
   * @param {string} fieldName : le champ concerné pour retiré sa valeur, par exemple cod_ind
   * @param extraDict : le Map<> utilisé pour app-data-table
   * @param fieldNamesFilters : on garde en mémoire les champs utilisés dans key
   */
  public deleteOperatorsUrlQS(key: string, fieldName: string,
                              extraDict: Map<string, string[]> = new Map<string, string[]>(),
                              fieldNamesFilters: Map<string, string> = new Map<string, string>()) {

    if (extraDict.has(key)) {
      const value = fieldNamesFilters.get(fieldName);

      const values = extraDict.get(key);
      const idxValue = values.indexOf(value);
      if (idxValue !== -1) {
        values.splice(idxValue, 1);
      }

      if (values && values.length === 0) {
        extraDict.delete(key);
      }
    }
  }
}
