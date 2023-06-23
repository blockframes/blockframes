import { Injectable } from '@angular/core';
import { WaterfallContract, WaterfallDocument, convertDocumentTo } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { where } from 'firebase/firestore';
import { map } from 'rxjs';

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

  public async getContract(id: string, waterfallId: string) {
    const document = await this.getValue<WaterfallDocument<WaterfallContract>>(id, { waterfallId });
    return convertDocumentTo<WaterfallContract>(document);
  }

  public titleContracts(titleId: string) {
    return this.valueChanges([
      where('meta.titleId', '==', titleId),
      where('meta.status', '==', 'accepted'),
      where('type', '==', 'contract')
    ], { waterfallId: titleId }).pipe(
      map(docs => docs.map(d => convertDocumentTo<WaterfallContract>(d)))
    );
  }

}