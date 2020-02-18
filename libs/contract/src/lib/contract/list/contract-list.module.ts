import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ContractListComponent } from './contract-list.component';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ContractListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    OverlayWidgetModule,
    TranslateSlugModule,
    FlexLayoutModule,
    RouterModule,

    // Material
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ],
  exports: [ContractListComponent]
})
export class ContractListModule {}
