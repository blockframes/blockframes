import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'mediaToRights'
})
export class MediaToRightsPipe implements PipeTransform {
  transform(value: string): string {
    return value === 'medias' ? 'rights' : value;
  }
}

@NgModule({
  declarations: [MediaToRightsPipe],
  imports: [CommonModule],
  exports: [MediaToRightsPipe]
})
export class MediaToRightsModule { }
