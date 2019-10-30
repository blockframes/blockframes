import { NgModule } from '@angular/core';
import { StorageImageDirective } from './storage-image.directive';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [StorageImageDirective],
  exports: [StorageImageDirective],
})
export class StorageImageModule {}
