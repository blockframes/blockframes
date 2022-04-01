import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '@blockframes/shared/model';

/**
 * This pipe display the position of the user if any;
 */
@Pipe({
  name: 'displayPosition'
})
export class DisplayPositionPipe implements PipeTransform {
  transform(user: User): string {
    return user.position ? ` | ${user.position}` : '';
  }
}

@NgModule({
  declarations: [DisplayPositionPipe],
  imports: [CommonModule],
  exports: [DisplayPositionPipe]
})
export class DisplayPositionModule { }
