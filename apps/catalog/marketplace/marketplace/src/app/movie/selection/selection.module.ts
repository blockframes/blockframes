import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogSelectionComponent } from './selection.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

// Custom modules
import { CatalogFormSelectionModule } from '../../distribution-right/selection-table/form-selection.module';

@NgModule({
  declarations: [CatalogSelectionComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    CatalogFormSelectionModule,
    // Material
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
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
