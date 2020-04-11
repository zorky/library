import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Pagination<T> {
  total = 0;
  totalView = 0;
  list: T[] = [];
}
