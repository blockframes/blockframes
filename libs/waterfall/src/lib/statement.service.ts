import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Statement, createStatement } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';

function convertStatementsTo(statements: Statement[], versionId: string) {
  if (!versionId) return statements;
  const duplicatedStatements = statements.filter(s => !!s.duplicatedFrom);
  const rootStatements = statements.filter(s => !s.duplicatedFrom);
  return rootStatements.map(s => duplicatedStatements.find(d => d.duplicatedFrom === s.id && d.versionId === versionId) || s);
}

@Injectable({ providedIn: 'root' })
export class StatementService extends BlockframesSubCollection<Statement> {
  readonly path = 'waterfall/:waterfallId/statements';

  protected override fromFirestore(snapshot: DocumentSnapshot<Statement>) {
    if (!snapshot.exists()) return undefined;
    const statement = super.fromFirestore(snapshot);
    return createStatement(statement);
  }

  public statementsChanges(waterfallId: string, versionId: string) {
    return this.valueChanges({ waterfallId }).pipe(
      map(statements => convertStatementsTo(statements, versionId))
    );
  }

  public async statements(waterfallId: string, versionId?: string) {
    const statements = await this.getValue({ waterfallId });
    return convertStatementsTo(statements, versionId);
  }
}
