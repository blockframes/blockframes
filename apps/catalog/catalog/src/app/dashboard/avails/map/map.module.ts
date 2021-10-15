import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule } from "@angular/router";
import { AvailsFilterModule } from "@blockframes/contract/avails/filter/filter.module";
import { TableModule } from "@blockframes/ui/list/table/table.module";
import { MapModule } from "@blockframes/ui/map";
import { MaxLengthModule } from "@blockframes/utils/pipes";
import { DashboardAvailsMapComponent } from "./map.component";






@NgModule({
  declarations: [
    DashboardAvailsMapComponent,
  ],
  imports: [
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    TableModule,
    AvailsFilterModule,
    MapModule,

    //Material
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: DashboardAvailsMapComponent }])
  ]
})
export class CatalogDashboardAvailsMapModule { }
