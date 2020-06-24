import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieLanguageSpecification } from '@blockframes/movie/+state/movie.firestore';
import { CommonModule } from '@angular/common';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';


@Pipe({
  name: 'versionPipe'
})
export class VersionPipe implements PipeTransform {
  transform(language: MovieLanguageSpecification) {
    const formatSlug = (slug: string) => slug ? getLabelBySlug('VERSION_INFO', slug.trim().toLocaleLowerCase()) : '';

    const versionArray = [];
    for (const [key, value] of Object.entries(language)) {
      if (value) {
        versionArray.push(key);
      };
    }
    let version = '';
    versionArray.forEach((v, index) => {
      const isLast = index === versionArray.length - 1;
      version += formatSlug(v) + (isLast ? '' : ', ');
    })
    return version;
  }
}


@NgModule({
  declarations: [VersionPipe],
  imports: [CommonModule],
  exports: [VersionPipe]
})
export class VersionPipeModule { }
