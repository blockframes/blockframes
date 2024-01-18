import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Statement, convertStatementsTo, Waterfall, createStatement } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatementService extends BlockframesSubCollection<Statement> {
  readonly path = 'waterfall/:waterfallId/statements';

  protected override fromFirestore(snapshot: DocumentSnapshot<Statement>) {
    if (!snapshot.exists()) return undefined;
    const statement = super.fromFirestore(snapshot);
    return createStatement(statement);
  }

  public statementsChanges(waterfall: Waterfall, versionId: string) {
    return this.valueChanges({ waterfallId: waterfall.id }).pipe(
      map(statements => convertStatementsTo(statements, waterfall.versions.find(v => v.id === versionId)))
    );
  }

  public async statements(waterfall: Waterfall, versionId?: string) {
    const statements = await this.getValue({ waterfallId: waterfall.id });
    return convertStatementsTo(statements, waterfall.versions.find(v => v.id === versionId));
  }
}
