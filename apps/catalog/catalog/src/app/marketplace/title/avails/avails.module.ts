import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { MarketplaceMovieAvailsComponent } from './avails.component';
import { AvailsFilterModule } from '@blockframes/distribution-rights/components/avails-filter/avails-filter.module';
import { MapModule } from '@blockframes/ui/map';
import { RegionChipsAutocompleteModule } from '@blockframes/ui/form/region-chips-autocomplete/region-chips-autocomplete.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget/overlay-widget.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MarketplaceMovieAvailsComponent],
  imports: [
    CommonModule,
    AvailsFilterModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MapModule,
    RegionChipsAutocompleteModule,
    TranslateSlugModule,
    OverlayWidgetModule,

    // Material
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: MarketplaceMovieAvailsComponent }])
  ]
})
export class MarketplaceMovieAvailsModule { }
