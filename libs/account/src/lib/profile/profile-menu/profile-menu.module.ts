import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileMenuComponent } from './profile-menu.component';
import { StorageImageModule } from '@blockframes/ui/cropper/storage-image.module';

import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

const material = [MatMenuModule, MatDividerModule, MatIconModule, MatButtonModule, MatListModule];

@NgModule({
  imports: [CommonModule, StorageImageModule, ...material],
  declarations: [ProfileMenuComponent],
  exports: [ProfileMenuComponent]
})
export class ProfileMenuModule {}
