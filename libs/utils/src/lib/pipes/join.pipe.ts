import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'join', pure: true })
export class JoinPipe implements PipeTransform {
  transform(input:Array<any>, separator = ','):string {
    return input.join(separator);
  }
}
