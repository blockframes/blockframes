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
   */
  transform(value: Person | Person[] | string[], max?: number): string {
    if (Array.isArray(value)) {
      return (value as any)
        .map(person => typeof person === 'string' ? person : displayName(person))
        .slice(0, max)
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
