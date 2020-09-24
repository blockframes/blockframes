import { Pipe, PipeTransform, NgModule } from '@angular/core';

const referencesPaths = {
    movie: {
        banner: (docId: string) => `movies/${docId}/banner`,
        poster: (docId: string) => `movies/${docId}/poster`,
        still: (docId: string) => `movies/${docId}/promotional.still_photo`,
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
      key: keyof ReferencePath[Type]
  ): string {
    const getRef = referencesPaths[type][key] as any
    return getRef(docId)
  }
}

@NgModule({
  exports: [ReferencePipe],
  declarations: [ReferencePipe],
})
export class ReferencePathModule { }
