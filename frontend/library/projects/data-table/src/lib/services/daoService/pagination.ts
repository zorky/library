import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Pagination {
    total = 0;
    totalView = 0;
    list: any[] = [];
}

// @Injectable({   providedIn: 'root' })
// export class PaginationGeneric<T> {
//   total = 0;
//   totalView = 0;
//   list: T[] = [];
// }
