import { Pipe, PipeTransform, NgModule } from '@angular/core';

const referencesPaths = {
    movie: {
        banner: (docId: string) => `movies/${docId}/banner.media`,
        poster: (docId: string) => `movies/${docId}/poster.media`,
        still: (docId: string, elementId: string) => `movies/${docId}/promotionalElements.still_photo.${elementId}.media`,
    },
    profile: {
        avatar: (uid: string) => `users/${uid}/avatar`
    },
    organization: {
        logo: (docId: string) => `orgs/${docId}/logo`
    }
}
type ReferencePath = typeof referencesPaths;
type ReferenceType = keyof ReferencePath;

@Pipe({
  name: 'ref'
})
export class ReferencePipe implements PipeTransform {

  transform<Type extends ReferenceType>(
      docId: string,
      type: Type,
      key: keyof ReferencePath[Type],
      elementId?: number
  ): string {
    const getRef = referencesPaths[type][key] as any
    return getRef(docId, elementId)
  }
}

@NgModule({
  exports: [ReferencePipe],
  declarations: [ReferencePipe],
})
export class ReferencePathModule { }
