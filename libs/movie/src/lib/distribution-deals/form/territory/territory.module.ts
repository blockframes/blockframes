import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionDealTerritoryComponent } from './territory.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule
  ],
  declarations: [DistributionDealTerritoryComponent],
  exports: [DistributionDealTerritoryComponent]
})
export class TerritoryModule { }
