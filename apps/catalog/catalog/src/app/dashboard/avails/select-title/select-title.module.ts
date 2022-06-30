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
import { CatalogAvailsSelectTitleComponent } from "./select-title.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from "@angular/material/select";

@NgModule({
  declarations: [
    CatalogAvailsSelectTitleComponent,
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
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: CatalogAvailsSelectTitleComponent }]
    ),
  ]
})
export class CatalogAvailsSelectTitleModule { }
