import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieLanguageSpecification, movieLanguageTypes } from '@blockframes/model';

@Pipe({ name: 'versionPipe' })
export class VersionPipe implements PipeTransform {
  transform(language: MovieLanguageSpecification) {
    const formatKey = (key: string) =>
      key ? movieLanguageTypes[key.trim().toLocaleLowerCase()] : '';
    const results = [];

    Object.entries(language).map(([key, value]) => {
      if (value) results.push(formatKey(key));
    });

    return results;
  }
}

@NgModule({
  declarations: [VersionPipe],
  exports: [VersionPipe],
})
export class VersionPipeModule {}
