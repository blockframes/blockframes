import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { getKeyIfExists } from '../helpers';
import { CommonModule } from '@angular/common';

const registeredObjects = [
  'unitBox',
  'storeType',
  'storeStatus',
  'workType',
  'contractStatus',
  'distributionRightStatus',
  'contractType',
  'orgActivity'
] as const;

export type Label = typeof registeredObjects[number];

@Pipe({
  name: 'toLabel'
})
export class ToLabelPipe implements PipeTransform {
  private imports = [];
  async transform(value: string, type: Label): Promise<string> {

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
          this.imports[type] = await import('@blockframes/movie/+state/movie.firestore').then(e => e[type]);
          break;
        case 'contractStatus':
        case 'contractType':
          this.imports[type] = await import('@blockframes/contract/contract/+state/contract.firestore').then(e => e[type]);
          break;
        case 'distributionRightStatus':
          this.imports[type] = await import('libs/movie/src/lib/distribution-rights/+state/distribution-right.firestore').then(e => e[type]);
          break;
        case 'orgActivity':
          this.imports[type] = await import('@blockframes/organization/+state/organization.firestore').then(e => e[type]);
          break;
        default:
          break;
      }
    }
    return this.imports[type];
  }
}


@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule {}
