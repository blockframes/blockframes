import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ToolkitComponent } from './toolkit.component';

import { ThemeWidgetModule } from '../../theme/theme-widget/theme-widget.module';
import { IconsModule } from '../icons/icons.module';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ToolkitComponent],
  exports: [ToolkitComponent],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    ThemeWidgetModule,
    IconsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class ToolkitModule { }
