import { Injectable } from '@angular/core';
import { WaterfallContract, WaterfallDocument, convertDocumentTo, sortContracts } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { QueryConstraint, where } from 'firebase/firestore';
import { map } from 'rxjs';

const contractQuery = (): QueryConstraint[] => [
  where('meta.status', '==', 'accepted'),
  where('type', '==', 'contract'),
];

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

  /**
   * Fetch all contracts of a waterfall, ordered by signature date
   * @param titleId 
   * @returns 
   */
  public async getContracts(titleId: string) {
    const documents = await this.getValue(contractQuery(), { waterfallId: titleId });
    return sortContracts(documents.map(d => convertDocumentTo<WaterfallContract>(d)));
  }

  /**
   * Listen on all contracts of a waterfall, ordered by signature date
   * @param titleId 
   * @returns 
   */
  public titleContracts(titleId: string) {
    return this.valueChanges(contractQuery(), { waterfallId: titleId })
      .pipe(
        map(docs => sortContracts(docs.map(d => convertDocumentTo<WaterfallContract>(d))))
      );
  }

}