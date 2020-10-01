import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { ListPageModule } from '@blockframes/ui/list/page/list-page.module';

// Material
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    MatLayoutModule,
    OrganizationCardModule,
    ListPageModule,
    ReactiveFormsModule,

    MatRippleModule,
    MatProgressSpinnerModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
  ]
})
export class OrganizationListModule { }
