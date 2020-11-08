import {Injectable} from '@angular/core';

/**
 * Comparaison d'ensembles / tableaux
 * (inspiré de https://stackoverflow.com/a/54763194/55465)
 */
@Injectable({ providedIn: 'root' })
export class EnsemblesService {
  comparator = <T>(a: T, b: T, property: string = 'id') => a[property] === b[property];
  intersect<T>(list1, list2, comparator: (a, b) => boolean = this.comparator) {
    return list1.filter(a => list2.some(b => comparator(a, b)));
  }
  notInList1<T>(list1, list2, comparator: (a, b) => boolean = this.comparator) {
    return list2.filter(a => !list1.some(b => comparator(a, b)));
  }
  notInList2<T>(list1, list2, comparator: (a, b) => boolean = this.comparator) {
    return list1.filter(a => !list2.some(b => comparator(a, b)));
  }
}
