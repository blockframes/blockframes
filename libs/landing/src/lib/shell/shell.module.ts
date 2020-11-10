
// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Components
import {
  LandingShellComponent,
  HeaderShellComponent,
  ShellContentComponent,
  ShellContactComponent,
  ShellFooterComponent
} from './shell.component';

// Blockframes
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    AppLogoModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
  ],
  exports: [
    LandingShellComponent,
    HeaderShellComponent,
    ShellContentComponent,
    ShellContactComponent,
    ShellFooterComponent,
    AppLogoModule],
  declarations: [
    LandingShellComponent,
    HeaderShellComponent,
    ShellContentComponent,
    ShellContactComponent,
    ShellFooterComponent
  ],
})
export class LandingShellModule { }
