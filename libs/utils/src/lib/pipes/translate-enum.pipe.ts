import { Pipe, PipeTransform } from '@angular/core';
import { getKeyIfExists } from '../helpers';

const registeredEnums = [
  'unitBox'
];

export type RegisteredEnums = keyof typeof registeredEnums;

@Pipe({
  name: 'translateEnum'
})
export class TranslateEnumPipe implements PipeTransform {
  async transform(value: string, type: string): Promise<string> {

    if (registeredEnums.includes(type)) {
      let output;
      switch (type) {
        // KFH compatible import
        case 'unitBox':
          output = await import('@blockframes/movie/movie/+state/movie.firestore').then(e => e[type]);
        default:
          break;
      }
      if(output) {
        const key = getKeyIfExists(output, value);
        if (!!key) { return output[key] }
      }
    }

    console.error(`Enumeration "${type}" not found`);
    return value;
  }
}
