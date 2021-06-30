import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Person } from '../common-interfaces';
import { displayName } from '../utils'

/**
 * This pipe display the firstname and lastname of the person;
 * For an user, if you want to display organization name of the user also, use the displayUser pipe
 */
@Pipe({
  name: 'displayName'
})
export class DisplayNamePipe implements PipeTransform {

  /**
   * @param value value can be a Person, an array of Person or an
   * array of string if data comes from Algolia
   * @param max if value is an array, this can be used to tell how many items we want
   * @returns string
   * @TODO #5530 remove max and use css instead
   */
  transform(value: Person | Person[] | string[]): string {
    if (Array.isArray(value)) {
      return value
        .map(person => typeof person === 'string' ? person : displayName(person))
        .join(', ');
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
