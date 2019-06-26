import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

// Components
import { WelcomeComponent } from './welcome.component'

// Material
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    // Components
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,

    // Material
    MatButtonModule
  ],
  exports: [WelcomeComponent]
})
export class LandingPageModule {}
