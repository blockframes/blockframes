// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableModule } from "@blockframes/ui/list/table/table.module";

import { TitleListComponent } from './list.component';

// Blockframes
import { AppPipeModule, DisplayNameModule, MaxLengthModule, NumberPipeModule, ToLabelModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [TitleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableModule,
    MaxLengthModule,
    ToLabelModule,
    ImageModule,
    FilterByModule,
    DisplayNameModule,
    NoTitleModule,
    TagModule,
    NumberPipeModule,
    IncomePipeModule,
    AppPipeModule,

    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // Router
    RouterModule.forChild([{ path: '', component: TitleListComponent }])
  ]
})
export class TitleListModule { }
