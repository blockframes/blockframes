import { Pipe, PipeTransform } from '@angular/core';
import { getKeyIfExists } from '../helpers';

const registeredObjects = [
  'unitBox',
  'storeType',
  'storeStatus',
  'workType',
  'contractStatus',
  'distributionDealStatus',
];

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  private imports = [];
  async transform(value: string, type: string): Promise<string> {

    if (registeredObjects.includes(type)) {
      const object = await this.manageImport(type);
      if (object) {
        const key = getKeyIfExists(object, value);
        if (!!key) { return object[key] }
      }
    }

    console.error(`Readonly object "${type}" not found`);
    return value;
  }

  private async manageImport(type: string) {
    // Was it already imported ?
    if(!this.imports[type]) { 
      switch (type) {
        // KFH compatible import
        case 'unitBox':
        case 'storeType':
        case 'workType':
        case 'storeStatus':
          this.imports[type] = await import('@blockframes/movie/movie/+state/movie.firestore').then(e => e[type]);
          break;
        case 'contractStatus':
          this.imports[type] = await import('@blockframes/contract/contract/+state/contract.firestore').then(e => e[type]);
          break;
        case 'distributionDealStatus':
          this.imports[type] = await import('@blockframes/movie/distribution-deals/+state/distribution-deal.firestore').then(e => e[type]);
          break;
        default:
          break;
      }
    }
    return this.imports[type];
  }
}
