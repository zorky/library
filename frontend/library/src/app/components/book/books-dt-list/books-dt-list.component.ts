import {Component, OnInit, ViewChild} from '@angular/core';
import {
  ColumnDataTable
} from '../../../../../projects/data-table/src/lib/interfaces/data-table-column';
import {Author, Book} from '../../../services';
import {SubSink} from '../../../services/subsink';
import {ActionDataTable} from '../../../../../projects/data-table/src/lib/interfaces/data-table-action';
import {MatDataSourceGeneric, Pagination} from '../../../../../projects/data-table/src/lib/services/daoService';
import {DataTableComponent} from '../../../../../projects/data-table/src/lib/components/data-table.component';
import {DataTableHeaderColumnComponentService} from '../../../../../projects/data-table/src/lib/services/data-table-header-column-component.service';
import {BookDtService} from '../../../services/books/book-dt.service';
import {BooksListColumnComponent} from "../../author/author-dt-list/columns-components/books-list/books-list.component";
import {AuthorSelectComponent} from "./columns-components/author-select/author-select.component";
import {AuthorDtService} from "../../../services/authors/author-dt.service";

@Component({
  selector: 'app-books-dt-list',
  templateUrl: './books-dt-list.component.html',
  styleUrls: ['./books-dt-list.component.css']
})
export class BooksDtListComponent implements OnInit {
  columns: ColumnDataTable[] = [{
    column: 'book', header: 'Livre', sortField: 'name',
    display: (element: Book) => {
      return `${element.name}`;
    },
    // columnComponent: () => new ComponentItem(BooksListColumnComponent, null, 'columnAuthor'),
    flex: 20,
    sort: true
  },
    {
    column: 'author', header: 'Auteur',
    display: (element: Book) => {
      return `${element.author_obj.first_name} ${element.author_obj.last_name}`;
    },
    sort: false
  }];
  actions: ActionDataTable[] = [];
  dsBooks: MatDataSourceGeneric<Book> = new MatDataSourceGeneric<Book>();
  extraParams: Map<string, string> = new Map<string, string>();
  filterColumns: Map<string, Map<string, string>> = new Map<string, Map<string, string>>();
  @ViewChild(DataTableComponent, {static: false}) matDataTable: DataTableComponent;
  subSink = new SubSink();
  constructor(private dataTableHeaderSvc: DataTableHeaderColumnComponentService,
              private authorSvc: AuthorDtService,
              private bookSvc: BookDtService) {
    this.dsBooks.daoService = bookSvc;
  }

  ngOnInit(): void {
    this._setFilterAuthor();
  }
  _setFilterAuthor() {
    this.subSink.sink = this.authorSvc
      .listAllItems()
      .subscribe((authors: Pagination) => {
        const listAuthors = new Map<string, string>();
        (authors.list as Author[])
          .forEach((author) => listAuthors.set(author.id.toString(), `${author.first_name} ${author.last_name}`));
        this.filterColumns.set('author', listAuthors);
        this._setAuthorDynamicComponent('author', 'sur un auteur', 'author');
      });
  }
  private _columnSetValues(key): Map<string, string> {
    if (this.filterColumns.has(key)) {
      return this.filterColumns.get(key);
    }
    return new Map<string, string>();
  }
  private _setAuthorDynamicComponent(listName, listLabel, keyFilter,
                                     callBack: () => void = null) {
    const data = {
      filterColumns: this._columnSetValues(listName),
    };
    const filterComponent = this.dataTableHeaderSvc
      .createColumnComponent(
        this.columns, listName, `authors_list_${listName}`, `${listLabel}`,
        AuthorSelectComponent, data);
  }
}
