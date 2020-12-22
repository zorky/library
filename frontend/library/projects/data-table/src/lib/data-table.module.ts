import { NgModule } from '@angular/core';
import {DataTableFilterModaleComponent} from './components/data-table-filter-modale/data-table-filter-modale.component';
import {DataTableHeaderComponent} from './components/data-table-header-component/data-table-header.component';
import {HostViewHostDirective, RemoveHostViewContainerDirective} from './directives';
import {MaterialModule} from './modules/material.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {RemoveHostDirective} from './components/dynamic-core-components/remove-host.directive';
import {ComponentHostDirective} from './components/dynamic-core-components/component.directive';
import {DataTableComponent} from './components/data-table.component';
import { DataTableCellComponentComponent } from './components/data-table-cell-component/data-table-cell-component.component';

@NgModule({
  declarations: [
    DataTableComponent,
    HostViewHostDirective,
    ComponentHostDirective,
    RemoveHostDirective,
    RemoveHostViewContainerDirective,
    DataTableHeaderComponent,
    DataTableFilterModaleComponent,
    DataTableCellComponentComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    MaterialModule
  ],
  exports: [
    DataTableComponent,
    DataTableHeaderComponent,
    DataTableFilterModaleComponent]
})
export class DataTableModule { }
