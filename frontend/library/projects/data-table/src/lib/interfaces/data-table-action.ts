/**
 * interface pour les actions de data-table
 */
export interface ActionDataTable {
  /* identifiant action */
  label: string;

  /* tooltip bouton */
  tooltip: string;
  /* tooltip fonction, optionnel, surcharge tooltip */
  tooltipFun?: (row) => string;

  /* fonction d'obtention de la couleur d'affichage de la valeur du champ, optionnel, par défaut #000000 (noir) */
  color?: (row) => string;
  colorBackground?: (row) => string;

  /* fonctions couleurs colonne entéte texte et fond */
  colorHeader?: (row) => string;
  colorHeaderBackground?: (row) => string;

  /* icon material */
  icon: string;
  /* calcul icon material, optionnel, surcharge icon */
  iconFun?: (row) => string;

  /* couleur icone (couleurs material : primary | accent | warn */
  iconcolor?: string;
  iconcolorFun?: (row) => string;

  /* action (fonction) au click */
  click: (row) => void;

  /* flex colonne */
  flex?: number;

  /* afficher ligne ? */
  hidden?: (row) => boolean;
  /* afficher header / entête ? */
  hiddenHeader?: () => boolean;
}
