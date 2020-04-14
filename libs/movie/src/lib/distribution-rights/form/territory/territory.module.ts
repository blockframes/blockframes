// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { DistributionRightTerritoryComponent } from './territory.component';

// Modules
import { ChipsAutocompleteModule } from '@blockframes/ui/static-autocomplete/chips/chips-autocomplete.module';

@NgModule({
  imports: [CommonModule, FlexLayoutModule, ReactiveFormsModule, ChipsAutocompleteModule],
  declarations: [DistributionRightTerritoryComponent],
  exports: [DistributionRightTerritoryComponent]
})
export class DistributionRightTerritoryModule {}
