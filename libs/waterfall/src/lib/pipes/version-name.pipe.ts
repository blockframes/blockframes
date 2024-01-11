import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Waterfall, getDefaultVersion } from '@blockframes/model';

@Pipe({ name: 'versionName' })
export class VersionNamePipe implements PipeTransform {
  transform(versionId: string, waterfall: Waterfall) {
    if (!versionId) return getDefaultVersion(waterfall)?.name || '--';
    return waterfall.versions.find(v => v.id === versionId)?.name || '--';
  }
}

@NgModule({
  declarations: [VersionNamePipe],
  exports: [VersionNamePipe],
})
export class VersionNamePipeModule { }
