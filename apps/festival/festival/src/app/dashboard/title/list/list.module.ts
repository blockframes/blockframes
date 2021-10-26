// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { ToLabelModule } from '@blockframes/utils/pipes';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { FilterByModule } from '@blockframes/utils/pipes/filter-by.pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    TableModule,
    ToLabelModule,
    DisplayNameModule,
    ImageModule,
    NoTitleModule,
    FilterByModule,
    TagModule,
    // Material
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    // Router
    RouterModule.forChild([{ path: '', component: ListComponent }])
  ]
})
export class TitleListModule { }
