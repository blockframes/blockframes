import { Injectable } from '@angular/core';
import { WaterfallDocument } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class WaterfallDocumentsService extends BlockframesSubCollection<WaterfallDocument> {
  readonly path = 'waterfall/:waterfallId/documents';

  public async removeFile(documentId: string) {
    //  TODO #9389 call "deleteWaterfallFile" backend function
    // Only if ownerId === org.id
  }

  public async shareDocument(documentId: string, sharedWith: string[]) {
    // TODO #9389 Only if ownerId === org.id, puts/remove ids in sharedWith[]
  }

}