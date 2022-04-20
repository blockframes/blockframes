import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppBridgeBannerComponent } from './app-bridge-banner.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon'
import { MatRippleModule } from '@angular/material/core';
@NgModule({
  declarations: [AppBridgeBannerComponent],
  exports: [AppBridgeBannerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    MatRippleModule
  ]
})
export class AppBridgeBannerModule { }
