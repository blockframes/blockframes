import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '../common-interfaces';

export function displayName(person: Person) {
  const firstLetterUppercase = (name) => name[0].toUpperCase() + name.substring(1);
  const firstName = firstLetterUppercase(person.firstName);
  const lastName = firstLetterUppercase(person.lastName);
  return `${firstName} ${lastName}`;
}

@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {
  transform(value: Person | Person[]): string {
    if (Array.isArray(value)) {
      return value.map(person => {
        if (person?.firstName) {
          return displayName(person);
        } else {
          return value;
        }
      }).join(', ');
    } else {
      return displayName(value);
    }
  }
}

@NgModule({
  declarations: [DisplayNamePipe],
  imports: [CommonModule],
  exports: [DisplayNamePipe]
})
export class DisplayNameModule { }
