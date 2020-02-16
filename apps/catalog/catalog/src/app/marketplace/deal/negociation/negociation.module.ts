import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NegociationComponent } from './negociation.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [NegociationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: NegociationComponent }])
  ]
})
export class NegociationModule { }
