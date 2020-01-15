import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguagesComponent } from './languages.component';



@NgModule({
  declarations: [LanguagesComponent],
  exports: [LanguagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class MovieFormLanguagesModule { }
