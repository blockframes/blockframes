import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelMainComponent } from './main.component';
import { MovieFormReleaseModule } from '@blockframes/movie/movie/form/theatrical-release/theatrical-release.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [TunnelMainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormReleaseModule,
    TunnelPageModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: TunnelMainComponent }])
  ]
})
export class MainTunnelModule { }
