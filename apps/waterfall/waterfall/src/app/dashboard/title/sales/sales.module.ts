// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { SalesComponent } from './sales.component';

// Blockframes
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { MapModule } from '@blockframes/ui/map';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [SalesComponent],
  imports: [
    CommonModule,
    LogoSpinnerModule,
    FlexLayoutModule,
    MapModule,

    // Material
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,

    // Routing
    RouterModule.forChild([{ path: '', component: SalesComponent }]),
  ],
})
export class SalesModule { }
