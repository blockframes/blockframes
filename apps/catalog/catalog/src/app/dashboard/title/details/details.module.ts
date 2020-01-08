import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TitleDetailsComponent } from './details.component';


@NgModule({
  declarations: [TitleDetailsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: TitleDetailsComponent }])
  ]
})
export class TitleDetailsModule { }
