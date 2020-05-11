import {MatPaginatorIntl} from '@angular/material/paginator';

const frenchAuthorRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0 || pageSize === 0) {
    return `aucun auteur trouvé`;
  }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;
  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} sur ${length}`;
};

export function getAuthorFrenchPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'auteurs par page :';
  paginatorIntl.nextPageLabel = 'page suivante';
  paginatorIntl.previousPageLabel = 'page précédente';
  paginatorIntl.firstPageLabel = '1ère page';
  paginatorIntl.lastPageLabel = 'dernière page';
  paginatorIntl.getRangeLabel = frenchAuthorRangeLabel;

  return paginatorIntl;
}
