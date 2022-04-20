import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '@blockframes/model';
import { displayName } from '../utils';

export const displayPerson = (person: Person | Person[] | string[]) => {
  if (Array.isArray(person)) {
    return person
      .map(person => typeof person === 'string' ? person : displayName(person))
  } else {
    return [displayName(person)];
  }
}

/**
 * This pipe display the firstname and lastname of the person;
 * For an user, if you want to display organization name of the user also, use the displayUser pipe
 */
@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {

  /**
   * @param value value can be a Person, an array of Person or an
   * array of string if data comes from Algolia
   * @returns string
   */
  transform(value?: Person | Person[] | string[]): string {
    if (!value) return '';
    return displayPerson(value).join(', ');
  }
}

@NgModule({
  declarations: [DisplayNamePipe],
  imports: [CommonModule],
  exports: [DisplayNamePipe]
})
export class DisplayNameModule { }
