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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

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
