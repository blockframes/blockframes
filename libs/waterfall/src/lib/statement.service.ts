import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Statement, createStatement } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class StatementService extends BlockframesSubCollection<Statement> {
  readonly path = 'waterfall/:waterfallId/statements';

  protected override fromFirestore(snapshot: DocumentSnapshot<Statement>) {
    if (!snapshot.exists()) return undefined;
    const statement = super.fromFirestore(snapshot);
    return createStatement(statement);
  }
}
