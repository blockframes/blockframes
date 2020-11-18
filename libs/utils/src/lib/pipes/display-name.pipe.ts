import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '../common-interfaces';

export function titleCase(text: string) {
  if (!text) return '';
  return text[0].toUpperCase() + text.substring(1);
}

export function displayName(person: Person) {
  return `${titleCase(person.firstName)} ${titleCase(person.lastName)}`;
}

/**
 * This pipe display the firstname and lastname of the person;
 * For an user, if you want to display organization name of the user also, use the displayUser pipe
 */
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
