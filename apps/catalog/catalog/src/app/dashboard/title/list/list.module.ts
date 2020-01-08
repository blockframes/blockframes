import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleListComponent } from './list.component';


@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule { }
