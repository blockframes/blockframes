import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeWidgetComponent } from './theme-widget.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

const material = [MatIconModule, MatMenuModule, MatSlideToggleModule]

@NgModule({
  declarations: [ThemeWidgetComponent],
  exports: [ThemeWidgetComponent],
  imports: [
    CommonModule,
    ...material
  ]
})
export class ThemeWidgetModule { }
