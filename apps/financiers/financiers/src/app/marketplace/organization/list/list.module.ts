import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { ListPageModule } from '@blockframes/ui/list/page/list-page.module';
import { TitleFilterModule } from '@blockframes/movie/components/title-filter/title-filter.module';
import { FormCountryModule } from '@blockframes/ui/form';

// Material
import { MatRippleModule } from '@angular/material/core';
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
    TitleFilterModule,
    FormCountryModule,

    // Material
    MatRippleModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class OrganizationListModule { }
