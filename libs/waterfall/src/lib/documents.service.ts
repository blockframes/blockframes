import { Injectable } from '@angular/core';
import { Movie, WaterfallDocument, WaterfallFile, WaterfallRightholder } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { CallableFunctions } from 'ngfire';
import { AskContractData } from '@blockframes/utils/openai/utils';

@Injectable({ providedIn: 'root' })
export class WaterfallDocumentsService extends BlockframesSubCollection<WaterfallDocument> {
  readonly path = 'waterfall/:waterfallId/documents';

  constructor(private functions: CallableFunctions) {
    super();
  }

  public removeFile(data: { waterfallId: string, documentId: string }) {
    return this.functions.call<{ waterfallId: string, documentId: string }, unknown>('deleteWaterfallFile', data).catch(_ => undefined);
  }

  public askContractData(file: WaterfallFile, rightholders: WaterfallRightholder[], movie: Movie) {
    return this.functions.call<{ file, rightholders: WaterfallRightholder[], movie: Movie }, { response: AskContractData, question: string }>('askContractData', { file, rightholders, movie });
  }

}