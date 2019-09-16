import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CatalogFormSelectionComponent } from './form-selection.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [CatalogFormSelectionComponent],
  imports: [
    CommonModule,
    MatListModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [CatalogFormSelectionComponent]
})
export class CatalogFormSelectionModule {}
