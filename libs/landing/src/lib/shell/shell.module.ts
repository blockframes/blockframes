
// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Components & Directives
import {
  LandingShellComponent,
  HeaderShellComponent,
  ShellUSPComponent
} from './shell.component';

// Blockframes
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    AppLogoModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  exports: [
    LandingShellComponent,
    HeaderShellComponent,
    ShellUSPComponent],
  declarations: [
    LandingShellComponent,
    HeaderShellComponent,
    ShellUSPComponent],
})
export class LandingShellModule { }
