// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { OrganizationCardModule } from '@blockframes/organization/components/card/card.module';
import { ListPageModule } from '@blockframes/ui/list/page/list-page.module';
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { ChipsAutocompleteModule } from "@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module";

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ListComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: ListComponent }]),
    CommonModule,
    ReactiveFormsModule,
    OrganizationCardModule,
    ListPageModule,
    ListFilterModule,
    ChipsAutocompleteModule,
    
    // Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class OrganizationListModule { }
