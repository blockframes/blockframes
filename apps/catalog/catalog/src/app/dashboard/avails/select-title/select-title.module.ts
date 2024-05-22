import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Component
import { CatalogAvailsSelectTitleComponent } from './select-title.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { EmptyMovieModule } from '@blockframes/ui/dashboard/components/empty-movie/empty-movie.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [
    CatalogAvailsSelectTitleComponent,
  ],
  imports: [
    CommonModule,
    EmptyMovieModule,
    ToLabelModule,
    LogoSpinnerModule,

    //Material
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: CatalogAvailsSelectTitleComponent }]
    ),
  ]
})
export class CatalogAvailsSelectTitleModule { }
