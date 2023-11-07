import { Injectable } from '@angular/core';
import { WaterfallDocument } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { CallableFunctions } from 'ngfire';

@Injectable({ providedIn: 'root' })
export class WaterfallDocumentsService extends BlockframesSubCollection<WaterfallDocument> {
  readonly path = 'waterfall/:waterfallId/documents';

  constructor(private functions: CallableFunctions) {
    super();
  }

  public removeFile(data: { waterfallId: string, documentId: string }) {
    return this.functions.call<{ waterfallId: string, documentId: string }, unknown>('deleteWaterfallFile', data).catch(_ => undefined);
  }

}