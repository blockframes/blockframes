import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProfileWidgetComponent } from './profile-widget.component';

import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

const material = [MatMenuModule, MatIconModule];

@NgModule({
  imports: [CommonModule, RouterModule, ...material],
  declarations: [ProfileWidgetComponent],
  exports: [ProfileWidgetComponent]
})
export class ProfileWidgetModule {}
