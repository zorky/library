import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from '../modules/material.module';
import {FlexLayoutModule} from "@angular/flex-layout";
import {UploadComponent} from "../components/upload/upload.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
  ],
  declarations: [UploadComponent],
  exports: [UploadComponent],
})
export class CommonLibraryModule { }
