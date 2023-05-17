// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { HasAppStatusModule } from '@blockframes/movie/pipes/has-app-status.pipe';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Pages
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    ImageModule,
    HasAppStatusModule,
    LogoSpinnerModule,
    TableModule,
    DisplayNameModule,
    MaxLengthModule,

    // Material
    MatButtonModule,
    MatIconModule,

    // Routing
    RouterModule.forChild([{ path: '', component: HomeComponent }])
  ]
})
export class HomeModule { }