import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
// Material
import { MatRippleModule } from '@angular/material/core';


@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    OrganizationCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
  ]
})
export class OrganizationListModule { }
