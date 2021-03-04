import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { MarketplaceMovieAvailsComponent } from './avails.component';
import { MapModule } from '@blockframes/ui/map';
import { RegionChipsAutocompleteModule } from '@blockframes/ui/form/region-chips-autocomplete/region-chips-autocomplete.module';
import {  ToLabelModule } from '@blockframes/utils/pipes';
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
    FlexLayoutModule,
    ReactiveFormsModule,
    MapModule,
    RegionChipsAutocompleteModule,
    ToLabelModule,
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
