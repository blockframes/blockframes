import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule } from "@angular/router";
import { CatalogAvailsSelectTitleComponent } from "./select-title.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from "@angular/material/select";
import { EmptyMovieModule } from "@blockframes/ui/dashboard/components/empty-movie/empty-movie.module";
import { ToLabelModule } from "@blockframes/utils/pipes";

@NgModule({
  declarations: [
    CatalogAvailsSelectTitleComponent,
  ],
  imports: [
    CommonModule,
    EmptyMovieModule,
    ToLabelModule,

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
