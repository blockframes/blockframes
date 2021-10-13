import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicAccessComponent } from './public-access.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [PublicAccessComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: PublicAccessComponent }]),
  ]
})
export class PublicAccessModule { }
