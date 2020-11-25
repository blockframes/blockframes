import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'roomColumns', pure: true})
export class RoomPipe implements PipeTransform {
  transform(length: number) {
    return `repeat(${Math.ceil(Math.sqrt(length))}, auto)`;
  }
}

