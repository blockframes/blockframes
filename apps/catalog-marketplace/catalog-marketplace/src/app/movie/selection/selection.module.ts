import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CatalogFormSelectionComponent } from '../../distribution-right/selection-table/form-selection.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogSelectionComponent } from './selection.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [CatalogSelectionComponent, CatalogFormSelectionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatDividerModule,
    MatSortModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatDatepickerModule,
    MatListModule,
    MatSelectModule,

    RouterModule.forChild([
      {
        path: '',
        component: CatalogSelectionComponent
      }
    ])
  ]
})
export class SelectionModule {}
