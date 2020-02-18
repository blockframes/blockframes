import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

import { TitleListComponent } from './list.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    // Router
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule { }
