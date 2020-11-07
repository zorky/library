import {
  AfterViewInit, Component,
  ElementRef, EventEmitter,
  Input, OnDestroy,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import {Subscription, fromEvent, BehaviorSubject, of} from 'rxjs';
import {distinctUntilChanged, filter, debounceTime, finalize, catchError} from 'rxjs/operators';

import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTable} from '@angular/material/table';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

import {MatDataSourceGeneric, Pagination} from '../services/daoService';
import {ColumnDataTable} from '../interfaces/data-table-column';
import {ActionDataTable} from '../interfaces/data-table-action';
import {ComponentHostDirective} from './dynamic-core-components/component.directive';
import {DataTableHeaderCommunicationService} from '../services/data-table-communication.service';
import {ComponentItem} from './dynamic-core-components/component-item';
import {DataTableFilterModaleComponent} from './data-table-filter-modale/data-table-filter-modale.component';

@Component({
  selector: 'mat-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Source de données
   * Contient la fonction list(), et les éléments pour le sort et pagination
   */
  @Input()
  dataSource: MatDataSourceGeneric<any> = null;

  /** Les colonnes à afficher */
  @Input()
  columns: ColumnDataTable[] = null;

  /** Complète la querystring, <clé, valeur> */
  @Input()
  extraParams: Map<string, string> = null;

  /**
   * Complète la querystring, <clé, valeur[]>
   *     pour les paramétres ayant pour une même clé, plusieurs valeurs
   *     key=val1&key=val2&...&key=valn
   */
  @Input()
  extraDict: Map<string, string[]> = null;

  /** Les actions possibles pour une ligne */
  @Input()
  actions: ActionDataTable[] = null;

  /** Taille max de la page, nb. d'éléments / page */
  @Input()
  pageSize = 10;

  /** Choix du nombre max d'éléments / page */
  @Input()
  pageSizesList: number[] = [5, 10, 25];

  /** Afficher les boutons 1ère et dernière page ? */
  @Input()
  showFirstLastButtons = false;

  @Input()
  flexColumn = 90;

  @Input()
  flexAction = 5;

  /**
   * Affichage de la recherche ?
   * Par défaut oui
   */
  @Input()
  filterDisplay = true;

  /**
   * à partir de combien de car. la recherche se déclenche-t-elle ?
   * Par défaut >= 3
   */
  @Input()
  minFilter = 3;

  @Input()
  placeHolderFilter = 'Recherche';

  @Input()
  toolTipFilter = 'au moins 3 caractères';

  /**
   * activation loader
   */
  @Input()
  showLoader = false;

  /**
   * le loader masque-t-il la page ?
   */
  @Input()
  loaderMask = false;

  /**
   * le progress bar est-il activé ?
   */
  @Input()
  loaderProgress = true;

  @Input()
  colorHeader = 'auto';

  @Input()
  colorHeaderBackground = 'auto';

  @Input()
  fontSizeCell = 'auto';

  /**
   * URL à surcharger pour la liste, par défaut le dataSource.list()  (DaoGeneric.listItems())
   */
  @Input()
  urlBaseOverride: string = null;
  /**
   * si un id est passé, on cherchera dans urlBaseOverride ##id## pour le substitué à urlBaseOverrideInjectId
   * exemple, urlBaseOverride = `${environment.baseUrl}/api_referentiels_operations/operations/##id##/operation_composantes/`;
   *          urlBaseOverrideInjectId = 3
   *          l'url devient `${environment.baseUrl}/api_referentiels_operations/operations/3/operation_composantes/`
   */
  @Input()
  urlBaseOverrideInjectId: string = null;

  /**
   * Boutons de rechargement de la liste ?
   */
  @Input() refreshButton = false;
  @Input() refreshIcone = true;

  /**
   * Affiche-t-on la légende des filtres colonnes ?
   */
  @Input() filtersLegend = false;

  @Input()
  textIfListEmpty = 'Aucun élément trouvé';

  @Output()
  listLoaded = new EventEmitter<Pagination>();

  @Output()
  onSelectRow: EventEmitter<any> = new EventEmitter<any>();

  /**
   * https://angular.io/guide/static-query-migration
   */
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatTable, {static: true}) table: MatTable<any>;
  @ViewChild(ComponentHostDirective, {static: true}) host: ComponentHostDirective;
  @ViewChild('filter', {static: false}) filter: ElementRef;
  private filterChange = new BehaviorSubject('');

  total = 0;

  subSort: Subscription;
  subPage: Subscription;
  subFilter: Subscription;
  subList: Subscription;

  subscriptions: Subscription[] = [];

  loading = false;

  /**
   * filtres déjà ouverts
   * @type {Map<number, boolean>}
   */
  filtersSelected: Map<number, boolean> = new Map<number, boolean>();

  headerComponents: ComponentItem[] = [];
  filtersActivated: ComponentItem[] = [];

  isTableHasData = true;
  constructor(public dialogFilter: MatDialog,
              public dtCommunicationSvc: DataTableHeaderCommunicationService) {

  }

  refreshList(event) {
    this.reload();
  }

  /**
   * Obtient le n° de page courante (indice comment à 0)
   */
  get pageIndex() {
    if (this.dataSource.paginator) {
      return this.dataSource.paginator.pageIndex;
    }

    return 0;
  }

  /**
   * Rechargement des données (appel dataSource.list())
   * @param {number} indexPage : index de la page où aller, par défaut 0 (1ere page)
   */
  reload(indexPage = 0) {
    if (this.dataSource.paginator) {
      this.dataSource.paginator.pageIndex = indexPage;
    }

    this.getList();
  }

  /**
   * Envoi demande de réinit à tous les filtres
   */
  reinitFilters() {
    this.dtCommunicationSvc.sendReinitAllFilters(true);
    this.filtersActivated = [];
  }

  /**
   * Envoi demande de réinit pour un filtre
   * @param f : filtre à annuler
   */
  reinitFilter(f) {
    this.dtCommunicationSvc.sendReinitFilter(f.name);
    this.removeFilterFromActivated(f);
  }

  removeFilterFromActivated(f) {
    const idx = this.filtersActivated.indexOf(f);
    if (idx !== -1) {
      this.filtersActivated.splice(idx, 1);
    }
  }

  /**
   * Obtention des colonnes (colonne et actions) à afficher
   * => columnDef ou sortField si défini
   * @return {any[]}
   */
  get displayedColumns() {
    let columns = [];
    if (this.columns) {
      columns = this.columns.map(c => {
        if (c.sortField) {
          return c.sortField;
        }

        return c.column;
      });
    }

    let actions = [];
    if (this.actions) {
      actions = this.actions.map(a => a.label);
    }

    return [...columns, ...actions];
  }

  /**
   * Y a-t-il au moins un filtre sur une colonne ?
   */
  hasFilters() {
    return this.columns.some(col => 'headerComponent' in col);
  }

  /**
   * Calcul de la largeur flex pour une colonne champ ou action
   * @param type
   * @param colaction
   * @param row
   * @return {string}
   */
  flexWidth(type, colaction, row) {
    let pourcent = '10%';

    switch (type) {
      case 'column' :
        pourcent = `${this.flexColumn}%`;
        break;
      case 'action' :
        pourcent = `${this.flexAction}%`;
        break;
    }

    if (colaction && colaction.flex) {
      pourcent = `${colaction.flex}%`;
    }

    return pourcent;
  }

  /**
   * Le filtre a-t-il été déjà ouvert ?
   * @param {number} idx
   * @return {boolean}
   */
  isSelected(idx: number) {
    return !!(this.filtersSelected.has(idx) && this.filtersSelected.get(idx));
  }

  /**
   * Ouverture du filtre en dialog
   * @param {MouseEvent} event : MouseEvent, servira pour le calcul de la position de la dialog
   * @param {ComponentItem} component
   * @param {number} idx : indice de la colonne
   * @param {ColumnDataTable} column : pour la prise en compte de headerFilterOptions s'il existe
   */
  filterShow(event: MouseEvent, component: ComponentItem, idx: number, column: ColumnDataTable) {
    if (component.name) {
        const hasComponent = this.headerComponents.find((cmp: ComponentItem) => cmp.name === component.name);
        if (!hasComponent) {
          this.headerComponents.push(component);
        }
    }

    this.filtersSelected.set(idx, true);

    const target = new ElementRef(event.currentTarget);
    const data = {
      component,
      trigger: target,
      position: column.headerFilterOptions ? column.headerFilterOptions.position : 'bottom'
    };

    const matDialogConfig: MatDialogConfig = new MatDialogConfig();

    matDialogConfig.autoFocus = true;
    matDialogConfig.disableClose = false;
    matDialogConfig.hasBackdrop = column.headerFilterOptions ? column.headerFilterOptions.hasBackDrop : true;
    matDialogConfig.closeOnNavigation = true;
    matDialogConfig.data = data;

    const dialogRef = this.dialogFilter.open(DataTableFilterModaleComponent, matDialogConfig);
    const sub = dialogRef.afterClosed().subscribe((v) => {
      setTimeout(() => this.filtersSelected.delete(idx));
    });
    this.subscriptions.push(sub);
  }

  /**
   * Hidden fonction pour le header de la colonne
   * @param elt
   */
  getHiddenHeader(elt: ColumnDataTable) {
    if (elt && elt.hiddenHeader && typeof elt.hiddenHeader === 'function') {
      return elt.hiddenHeader.call(null, null);
    }

    return false;
  }

  /**
   * Hidden fonction pour la valeur de la ligne / colonne
   * @param {ColumnDataTable} elt
   * @param row
   */
  getHidden(elt: ColumnDataTable, row = null) {
    if (elt && elt.hidden) {
      return elt.hidden;
    }

    if (row && elt && elt.hiddenFun && typeof elt.hiddenFun === 'function') {
      return elt.hiddenFun.call(null, row);
    }

    return false;
  }

  /**
   * Hidden fonction pour les lignes actions
   * @param elt
   * @param row
   */
  getHiddenAction(elt: ActionDataTable, row = null) {
    if (row && elt && elt.hidden && typeof elt.hidden === 'function') {
      return elt.hidden.call(null, row);
    }

    return false;
  }

  /**
   * Hidden fonction pour les header actions
   * @param elt
   */
  getHiddenActionHeader(elt: ActionDataTable) {
    if (elt && elt.hiddenHeader && typeof elt.hiddenHeader === 'function') {
      return elt.hiddenHeader.call(null, null);
    }

    return false;
  }

  /**
   * Obtention du libellé de la colonne, appel de la fct headerFct si existante, header sinon
   * @param column
   * @param row
   */
  getHeaderLabel(column: ColumnDataTable, row) {
    if (column.headerFun && typeof column.headerFun === 'function') {
      return column.headerFun.call(null, row);
    }

    return column.header;
  }

  /**
   * Obtention de la couleur, appel de la fonction "color(row)" ou "colorHeader(row)"
   *
   * @param elt : pour obtenir la fonction color ou colorHeader
   * @param row : l'objet à afficher
   * @param perimeter : périmètre de recherche : value | header
   * @return {any} la couleur, par défaut noire (#000000) si indéfinie
   */
  getColor(elt: ColumnDataTable | ActionDataTable, row, perimeter = 'value') {
    if (elt) {
      switch (perimeter) {
        case 'value':
          if (elt.color && typeof elt.color === 'function') {
            return elt.color.call(null, row);
          }
          break;
        case 'header':
          if (elt.colorHeader && typeof elt.colorHeader === 'function') {
            return elt.colorHeader.call(null, row);
          }

          return this.colorHeader;
      }
    }

    return 'currentColor';
  }

  /**
   * Taille de la font
   * @param {ColumnDataTable | ActionDataTable} elt
   * @param row
   * @return {string}
   */
  getFontSize(elt: ColumnDataTable | ActionDataTable, row) {
    return this.fontSizeCell;
  }

  /**
   * Obtention de la couleur de fond, appel de la fonction "colorBackground(row)" ou "colorHeaderBackground(row)"
   *
   * @param elt : pour obtenir la fonction colorBackground ou colorHeaderBackground
   * @param row : l'objet à afficher
   * @param perimeter : périmètre de recherche : value | header
   * @return {any} la couleur, par défaut noire (#000000) si indéfinie
   */
  getColorBackground(elt: ColumnDataTable | ActionDataTable, row, perimeter = 'value') {
    if (elt) {
      switch (perimeter) {
        case 'value':
          if (elt.colorBackground && typeof elt.colorBackground === 'function') {
            return elt.colorBackground.call(null, row);
          }
          break;
        case 'header':
          if (elt.colorHeaderBackground && typeof elt.colorHeaderBackground === 'function') {
            return elt.colorHeaderBackground.call(null, row);
          }

          return this.colorHeaderBackground;
      }
    }

    return '#FFFFFF';
  }

  /**
   * Tooltip de la cellule le cas échéant
   * @param {ColumnDataTable} column
   * @param row
   */
  getTooltip(column: ColumnDataTable, row) {
    if (column) {
      if (column.tooltip && typeof column.tooltip === 'function') {
        return column.tooltip.call(null, row);
      }
    }

    return '';
  }

  /**
   * Tooltip à afficher sur l'icone filtre
   * @param {ColumnDataTable} column
   * @param row
   */
  getToolTipFilter(column: ColumnDataTable, row) {
    if (column && column.headerFilterToolTip && typeof column.headerFilterToolTip === 'function') {
      return column.headerFilterToolTip.call(null, row);
    }

    return 'Filtrer';
  }

  /**
   * Tooltip du bouton pour enlever un filtre
   * on ajoute la condition si elle existe
   */
  getToolTipButtonFilter(filter: ComponentItem) {
    if (filter.condition) {
      return `enlever ce filtre : ${filter.condition}`;
    }

    return 'enlever ce filtre';
  }


  /**
   * Ecoute de la recherche
   */
  ngAfterViewInit(): void {
    if (this.filterDisplay) {
      const sub = fromEvent(this.filter.nativeElement, 'keyup')
        .pipe(debounceTime(400),
          distinctUntilChanged(),
          filter(() => {
            return this.filter.nativeElement.value.length >= this.minFilter || this.filter.nativeElement.value.length === 0;
          }))
        .subscribe(() => {
          let filterValue = this.filter.nativeElement.value;
          filterValue = filterValue.trim().toLowerCase();
          this.paginator.pageIndex = 0;
          this.dataSource.filterChange.next(filterValue);
        });
      this.subscriptions.push(sub);
    }

    this.getList();
  }

  /**
   * Rattachement des components sort, paginator, filter à la datasource
   * Hook pour la détection lorsqu'un filtre est activé ou désactivé (pour la réinit totale ou la couleur de l'icone)
   */
  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterChange = this.filterChange;

    const sub = this.dtCommunicationSvc.filterUsed$.subscribe((data) => {
      const filtersActivated = this.headerComponents.find((cmp) => cmp.name === data.name);
      if (filtersActivated) {
        const find = this.filtersActivated.find((cmp) => cmp.name === filtersActivated.name);
        if (! find  && data.used) {
          this.filtersActivated.push(filtersActivated);
        }

        if (find && ! data.used) {
          this.removeFilterFromActivated(find);
        }

        if (data && data.value && data.value.condition) {
          filtersActivated.condition = data.value.condition;
        }
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Le filtre est-il utilisé ? (critères positionnés et filtre lancé)
   *
   * @param component
   * @param column
   * @return {string} : la couleur, si non précisée ou filtre non utilisé => 'auto'
   */
  isFilterUsed(component, column: ColumnDataTable) {
    if (this.filtersActivated && this.filtersActivated.length > 0) {
      const isUsed = this.filtersActivated.find((cmp) => cmp === component);
      if (isUsed) {
        if (column.headerFilterOptions && column.headerFilterOptions.colorIcon) {
          return column.headerFilterOptions.colorIcon;
        }

        return 'accent';
      }
    }

    return 'auto';
  }

  /**
   * Couleur de l'icone si renseigné : primary | accent | warn | auto si vide
   * @param action
   */
  // getColorIcon(action: ActionDataTable) {
  //   if (action && action.iconcolor) {
  //     console.log('action color ', action.iconcolor);
  //     return action.iconcolor;
  //   }
  //
  //   return 'auto';
  // }

  /**
   * Unsubscribe des obs liés à la datatable (list, sort, pagination, filtre)
   */
  unsubscribeSubscriptionDataTable() {
    if (this.subList) {
      this.subList.unsubscribe();
    }

    if (this.subSort) {
      this.subSort.unsubscribe();
    }

    if (this.subPage) {
      this.subPage.unsubscribe();
    }

    if (this.subFilter) {
      this.subFilter.unsubscribe();
    }
  }

  /**
   * Unsubscribe des autres observers autre que list, sort, pagination, filtre
   */
  unsubscribe() {
    if (this.subscriptions) {
      this.subscriptions.forEach(sub => {
        if (sub) {
          sub.unsubscribe();
        }});
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptionDataTable();
    this.unsubscribe();
  }

  /**
   * subscriptions sur sort, paginator, filter
   */
  onSortPageFilterChange() {
    if (this.dataSource.sort) {
      this.subSort = this.dataSource.sort.sortChange.subscribe(() => {
        this.toggleLoading(true);
        if (this.dataSource.paginator !== null) {
          this.dataSource.paginator.pageIndex = 0;
        }
      });
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.page.subscribe(() => this.toggleLoading(true));
    }

    if (this.dataSource.filterChange) {
      this.dataSource.filterChange.subscribe(() => this.toggleLoading(true));
    }
  }

  /**
   * Déclenchement de la fonction MatDataSourceGeneric<T>.list()
   */
  getList() {
    this.unsubscribeSubscriptionDataTable();
    this.onSortPageFilterChange();
    let urlBaseOverride = null;

    if (this.urlBaseOverride) {
      if (this.urlBaseOverrideInjectId) {
        urlBaseOverride =  this.urlBaseOverride.replace('##id##', this.urlBaseOverrideInjectId);
      } else {
        urlBaseOverride = this.urlBaseOverride;
      }
    }

    this.subList = this.dataSource
      .list(this.extraParams, this.extraDict, urlBaseOverride)
      .pipe(
        finalize( () => this.toggleLoading(false)),
        catchError(() => {
          this.toggleLoading(false);
          return of([]);
        }))
      .subscribe((data: Pagination) => {
        this.toggleLoading(false);
        this.total = data.total;
        this.dataSource.datasource.data = data.list;
        this.listLoaded.emit(data);
    });
  }

  /**
   * Activation spinner si option activée
   * @param value
   */
  toggleLoading(value) {
    if (this.showLoader) {
      setTimeout(() => this.loading = value);
    }
  }

  onRowClick(event, row) {
    if (event.isTrusted) {
      this.onSelectRow.emit(row);
    }
  }

  onRowHover(event, row) {
    // this.selectedRow = row;
  }
}

