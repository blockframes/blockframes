import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Waterfall, smartJoin } from '@blockframes/model';

@Pipe({ name: 'rightholderName' })
export class RightHolderNamePipe implements PipeTransform {
  transform(id: string | null | undefined, waterfall: Waterfall): string
  transform(id: string[], waterfall: Waterfall): string[]
  transform(id: string | null | undefined | string[], waterfall: Waterfall): string | string[] {
    const fallBack = 'Unknown';
    if (!id) return fallBack;
    const ids = Array.isArray(id) ? id : [id];
    const rightholders = ids.map(id => waterfall.rightholders.find(r => r.id === id) ? waterfall.rightholders.find(r => r.id === id).name : fallBack);
    return smartJoin(rightholders);
  }
}

@NgModule({
  declarations: [RightHolderNamePipe],
  exports: [RightHolderNamePipe],
})
export class RightHolderNamePipeModule { }
