import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { CatalogManageAvailsComponent } from './manage.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { LanguagesFormModule } from '@blockframes/movie/form/languages/languages.module';
import { JoinPipeModule, MaxLengthModule, ToGroupLabelPipeModule, ToLabelModule, VersionPipeModule } from '@blockframes/utils/pipes';
import { FormTableModule } from '@blockframes/ui/form/table/form-table.module';

@NgModule({
  declarations: [
    CatalogManageAvailsComponent,
  ],
  imports: [
    CommonModule,
    ToLabelModule,
    FormTableModule,
    MaxLengthModule,
    JoinPipeModule,
    AvailsFilterModule,
    LanguagesFormModule,
    VersionPipeModule,
    ToGroupLabelPipeModule,

    //Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,

    RouterModule.forChild([{ path: '', component: CatalogManageAvailsComponent }]
    ),
  ]
})
export class CatalogManageAvailsModule { }
