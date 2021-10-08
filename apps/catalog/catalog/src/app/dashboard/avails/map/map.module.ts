import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule, Routes } from "@angular/router";
import { AvailsFilterModule } from "@blockframes/contract/avails/filter/filter.module";
import { TableModule } from "@blockframes/ui/list/table/table.module";
import { MapModule } from "@blockframes/ui/map";
import { MaxLengthModule } from "@blockframes/utils/pipes";
import { CatalogDashboardAvailsMapComponent } from "./map.component";

const routes: Routes = [
  {
    path: '',
    component: CatalogDashboardAvailsMapComponent,
  },
]




@NgModule({
  declarations:[
    CatalogDashboardAvailsMapComponent,
  ],
  imports:[
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    TableModule,
    AvailsFilterModule,
    RouterModule.forChild(routes),
    MapModule,

    //Material
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatIconModule,
  ]
})
export class CatalogDashboardAvailsMapModule{}
