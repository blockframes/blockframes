import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { getGuest } from '@blockframes/model';


@Pipe({ name: 'guest', pure: true })
export class GuestPipe implements PipeTransform {
  transform = getGuest;
}

@NgModule({
  declarations: [GuestPipe],
  exports: [GuestPipe],
})
export class GuestPipeModule {}