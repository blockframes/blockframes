import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule } from "@angular/router";
import { CatalogManageAvailsComponent } from "./manage.component";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from "@angular/material/select";
import { EmptyMovieModule } from "@blockframes/ui/dashboard/components/empty-movie/empty-movie.module";
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from "@blockframes/utils/pipes";
import { FormTableModule } from "@blockframes/ui/form/table/form-table.module";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  declarations: [
    CatalogManageAvailsComponent,
  ],
  imports: [
    CommonModule,
    EmptyMovieModule,
    ToLabelModule,
    FormTableModule,
    ToLabelModule,
    MaxLengthModule,
    JoinPipeModule,
    AvailsFilterModule,
    LanguagesFormModule,
    VersionPipeModule,
    ToGroupLabelPipeModule,

    //Material
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,

    RouterModule.forChild([{ path: '', component: CatalogManageAvailsComponent }]
    ),
  ]
})
export class CatalogManageAvailsModule { }
