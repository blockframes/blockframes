// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { MovieTableGridModule } from '@blockframes/movie/dashboard/table-grid/table-grid.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

// Pages
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ImageModule,
    LogoSpinnerModule,
    MovieTableGridModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,

    // Routing
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }
