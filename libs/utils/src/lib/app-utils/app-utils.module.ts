import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppUtilsComponent } from './app-utils.component';

@NgModule({
  declarations: [AppUtilsComponent],
  exports: [AppUtilsComponent],
  imports: [CommonModule]
})
export class AppUtilsModule { }
