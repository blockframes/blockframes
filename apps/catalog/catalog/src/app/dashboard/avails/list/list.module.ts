import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule, Routes } from "@angular/router";
import { AvailsFilterModule } from "@blockframes/contract/avails/filter/filter.module";
import { TableModule } from "@blockframes/ui/list/table/table.module";
import { MaxLengthModule } from "@blockframes/utils/pipes";
import { CatalogAvailsListComponent } from "./list.component";

const routes: Routes = [
  {
    path: '',
    component: CatalogAvailsListComponent,
  },
]




@NgModule({
  declarations:[
    CatalogAvailsListComponent,
  ],
  imports:[
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    TableModule,
    AvailsFilterModule,
    RouterModule.forChild(routes),

    //Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class CatalogAvailsListModule{}
