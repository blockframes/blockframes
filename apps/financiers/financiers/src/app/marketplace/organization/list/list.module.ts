import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list.component';
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
// Material
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    MatLayoutModule,
    OrganizationCardModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
  ]
})
export class OrganizationListModule { }
