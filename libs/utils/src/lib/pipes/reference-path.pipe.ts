import { Pipe, PipeTransform, NgModule } from '@angular/core';

const referencesPaths = {
    movie: {
        banner: (id: string) => `movies/${id}/promotionalElements.banner.media`,
        poster: (id: string, i: number) => `movies/${id}/promotionalElements.poster.${i}.media`, 
        still: (id: string, i: number) => `movies/${id}/promotionalElements.still_photo.${i}.media`,
    },
    profile: {
        avatar: (uid: string) => `users/${uid}/avatar`
    },
    organization: {
      logo: (id: string) => `orgs/${id}/logo`
    }
}
type ReferencePath = typeof referencesPaths;
type ReferenceType = keyof ReferencePath;

@Pipe({
  name: 'ref'
})
export class ReferencePipe implements PipeTransform {

  transform<Type extends ReferenceType>(
      id: string,
      type: Type,
      key: keyof ReferencePath[Type],
      index?: number
  ): string {
    const getRef = referencesPaths[type][key] as any
    return getRef(id, index)
  }
}

@NgModule({
    exports: [ReferencePipe],
    declarations: [ReferencePipe],
  })
  export class ReferencePathModule { }