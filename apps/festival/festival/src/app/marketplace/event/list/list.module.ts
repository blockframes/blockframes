import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { ListComponent } from './list.component';

// Blockframes
import { EventListModule } from '@blockframes/event/components/list/list.module';
import { ScreeningItemModule } from '@blockframes/event/components/screening-item/screening-item.module';
import { EventEmptyModule } from '@blockframes/event/components/empty/empty.module';
import { ListPageModule } from '@blockframes/ui/list/page/list-page.module'
import { ListFilterModule } from '@blockframes/ui/list/filter/list-filter.module';
import { AlgoliaChipsAutocompleteModule } from "@blockframes/ui/algolia/chips-autocomplete/algolia-chips-autocomplete.module";
import { FilterByDateModule } from '@blockframes/utils/pipes/filter-by-date.pipe';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ListComponent],
  imports: [
    CommonModule,
    EventListModule,
    EventEmptyModule,
    ScreeningItemModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: ListComponent }]),
    ListPageModule,
    ListFilterModule,
    MatProgressSpinnerModule,
    AlgoliaChipsAutocompleteModule,
    FilterByDateModule,
    FlexLayoutModule
  ]
})
export class ListModule { }
