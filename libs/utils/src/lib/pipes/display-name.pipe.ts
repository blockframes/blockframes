import { Pipe, PipeTransform } from '@angular/core';
import { Person } from '../common-interfaces';

@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {
  transform(value: Person | Person[]): string {
    const capitalize = (str: string) => str?.toUpperCase();
    if (Array.isArray(value)) {
      return value.map(person => {
        const firstName = capitalize(person.firstName);
        const lastName = capitalize(person.lastName);
        return `${firstName} ${lastName}`;
      }).join(', ');
    } else {
      const firstName = capitalize(value.firstName);
      const lastName = capitalize(value.lastName);
      return `${firstName} ${lastName}`;
    }
  }
}
