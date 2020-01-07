import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { RouterModule } from '@angular/router';
import { MainComponent } from './main.component';
import { MovieFormReleaseModule } from '@blockframes/movie/movie/form/theatrical-release/theatrical-release.module';

@NgModule({
  declarations: [MainComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MovieFormReleaseModule,
    RouterModule.forChild([{ path: '', component: MainComponent }])
  ]
})
export class MainTunnelModule { }
