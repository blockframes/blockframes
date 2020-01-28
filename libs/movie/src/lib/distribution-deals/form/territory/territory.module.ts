// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { DistributionDealTerritoryComponent } from './territory.component';

// Modules
import { ChipsAutocompleteModule } from '@blockframes/ui/form/chips-autocomplete/chips-autocomplete.module';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, ReactiveFormsModule, ChipsAutocompleteModule],
  declarations: [DistributionDealTerritoryComponent],
  exports: [DistributionDealTerritoryComponent]
})
export class DistributionDealTerritoryModule {}
