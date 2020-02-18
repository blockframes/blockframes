import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NegociationComponent } from './negociation.component';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [NegociationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    // Router
    RouterModule.forChild([{ path: '', component: NegociationComponent }])
  ]
})
export class NegociationModule { }
