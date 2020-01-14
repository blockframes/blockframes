import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CertificationsComponent } from './certifications/certifications.component';
import { MovieFormSalesInfoComponent } from './sales-info.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule, MatOptionModule, MatButtonModule, MatIconModule } from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search/ngx-mat-select-search.module';

@NgModule({
  declarations: [
    CertificationsComponent,
    MovieFormSalesInfoComponent,
  ],
  exports: [
    CertificationsComponent,
    MovieFormSalesInfoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Libraries
    NgxMatSelectSearchModule,

    // Material
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
  ]
})
export class MovieFormSalesInfoModule { }
