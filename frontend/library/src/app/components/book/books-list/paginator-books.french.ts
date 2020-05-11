import {MatPaginatorIntl} from '@angular/material/paginator';

const frenchBookRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0 || pageSize === 0) {
    return `aucun livre trouvé`;
  }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;
  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} sur ${length}`;
};

export function getBookFrenchPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'livres par page :';
  paginatorIntl.nextPageLabel = 'page suivante';
  paginatorIntl.previousPageLabel = 'page précédente';
  paginatorIntl.firstPageLabel = '1ère page';
  paginatorIntl.lastPageLabel = 'dernière page';
  paginatorIntl.getRangeLabel = frenchBookRangeLabel;

  return paginatorIntl;
}
