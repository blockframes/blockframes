import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';
import { ListPageModule } from '@blockframes/ui/list/page/list-page.module'
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ScreeningItemModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
    ListPageModule,
    ListFilterModule,
    AlgoliaChipsAutocompleteModule,
    FilterByDateModule,
    ImageModule,

    // Material
    MatDividerModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ListModule { }
