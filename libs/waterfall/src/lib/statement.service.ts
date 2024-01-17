import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Statement, Version, Waterfall, createStatement } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';

function convertStatementsTo(_statements: Statement[], version: Version) {
  if (!version?.id) return _statements;
  if (version.standalone) return _statements.filter(s => s.versionId === version.id);
  const statements = _statements.filter(s => !s.standalone);
  const duplicatedStatements = statements.filter(s => !!s.duplicatedFrom);
  const rootStatements = statements.filter(s => !s.duplicatedFrom);
  return rootStatements.map(s => duplicatedStatements.find(d => d.duplicatedFrom === s.id && d.versionId === version.id) || s);
}

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
