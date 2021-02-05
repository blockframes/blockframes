import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RightListComponent } from './list.component';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [RightListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    ToLabelModule,

    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: RightListComponent }])
  ]
})
export class RightListModule { }
