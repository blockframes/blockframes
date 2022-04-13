import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule } from "@angular/router";
import { AvailsFilterModule } from "@blockframes/contract/avails/filter/filter.module";
import { ImageModule } from "@blockframes/media/image/directives/image.module";
import { TableModule } from "@blockframes/ui/list/table/table.module";
import { MaxLengthModule } from "@blockframes/utils/pipes";
import { CatalogAvailsListComponent } from "./list.component";
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    CatalogAvailsListComponent,
  ],
  imports: [
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    TableModule,
    ImageModule,
    AvailsFilterModule,

    //Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: CatalogAvailsListComponent }]
    ),
  ]
})
export class CatalogAvailsListModule { }
