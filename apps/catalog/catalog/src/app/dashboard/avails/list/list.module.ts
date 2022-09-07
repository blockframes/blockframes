// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Modules
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';

// Pages
import { CatalogAvailsListComponent } from './list.component';

@NgModule({
  declarations: [
    CatalogAvailsListComponent,
  ],
  imports: [
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    //Blockframes
    TableModule,
    ImageModule,
    AvailsFilterModule,
    LogoSpinnerModule,
    //Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: CatalogAvailsListComponent }]
    ),
  ]
})
export class CatalogAvailsListModule { }
