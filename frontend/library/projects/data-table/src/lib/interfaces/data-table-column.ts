import {ColumnComponentItem, ComponentItem} from '../components/dynamic-core-components/component-item';

/**
 * Options ouverture popin filtre colonne
 */
export interface HeaderFilterOptions {
  colorIcon: 'accent' | 'primary' | 'warn';
  position: 'top' | 'bottom' | 'left' | 'right';
  hasBackDrop: boolean;
}

/**
 * interface pour les colonnes de data-table
 */
export interface ColumnDataTable {
  /* champs 'table' à afficher (et à trier le cas échéant) */
  column: string;
  /* sticket colonne ? */
  sticky?: boolean;
  /* composant cellule */
  columnComponent?: () => ColumnComponentItem;

  /* libellé de l'entête table */
  header: string;
  headerFun?: (row) => string;

  /* composant filtre colonne dans le header */
  headerComponent?: () => ComponentItem;
  /* tooltip du filtre colonne */
  headerFilterToolTip?: (row) => string;
  /* option du filtre colonne : positionnement, couleur, fond */
  headerFilterOptions?: HeaderFilterOptions;

  /* fonction d'obtention de la valeur du champ pour la ligne courante */
  display: (row) => any;

  /* flex largeur */
  flex?: number;

  /* fonction d'obtention de la couleur d'affichage de la valeur du champ, optionnel, par défaut #000000 (noir) */
  color?: (row) => string;
  colorBackground?: (row) => string;

  /* fonctions couleurs colonne entéte texte et fond */
  colorHeader?: (row) => string;
  colorHeaderBackground?: (row) => string;

  /* tri actif ou non */
  sort: boolean;
  /* champ de tri si différent de columnDef, optionnel */
  sortField?: string;

  /*  afficher ligne / colonne ? */
  hidden?: boolean;
  hiddenFun?: (row) => boolean;

  /* afficher header / entête ? */
  hiddenHeader?: () => boolean;

  /* tronquer le texte de la cellule ? */
  truncate?: boolean;

  /* centré le texte de la cellule ? */
  center?: boolean;

  /* tooltip */
  tooltip?: (row) => any;
}
