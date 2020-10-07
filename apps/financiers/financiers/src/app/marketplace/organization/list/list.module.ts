import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { ListPageModule } from '@blockframes/ui/list/page/list-page.module';
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { FormCountryModule } from '@blockframes/ui/form';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    OrganizationCardModule,
    ListPageModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
    ListFilterModule,
    FormCountryModule,

    // Material
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class OrganizationListModule { }
