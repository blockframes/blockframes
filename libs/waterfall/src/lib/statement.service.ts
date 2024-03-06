import { Injectable } from '@angular/core';
import { DocumentSnapshot, doc } from '@firebase/firestore';
import {
  Statement,
  convertStatementsTo,
  Waterfall,
  createStatement,
  StatementType,
  Duration,
  isStandaloneVersion,
  createDistributorStatement,
  createDirectSalesStatement,
  createProducerStatement
} from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';
import { WriteOptions } from 'ngfire';
import { AuthService } from '@blockframes/auth/service';

export interface CreateStatementConfig {
  producerId: string;
  rightholderId?: string; // Sender or Receiver depending on the statement type (distrib/outgoing)
  waterfall: Waterfall;
  versionId?: string;
  type: StatementType;
  duration: Duration;
  contractId?: string;
  incomeIds?: string[]; // For Producer (outgoing) Statement only
}

@Injectable({ providedIn: 'root' })
export class StatementService extends BlockframesSubCollection<Statement> {
  readonly path = 'waterfall/:waterfallId/statements';

  constructor(private authService: AuthService) {
    super();
  }


  protected override fromFirestore(snapshot: DocumentSnapshot<Statement>) {
    if (!snapshot.exists()) return undefined;
    const statement = super.fromFirestore(snapshot);
    return createStatement(statement);
  }

  onCreate(statement: Statement, { write }: WriteOptions) {
    const ref = this.getRef(statement.id, { waterfallId: statement.waterfallId });
    write.update(ref, '_meta.createdBy', this.authService.uid);
    write.update(ref, '_meta.createdAt', new Date());
  }

  onUpdate(statement: Statement, { write }: WriteOptions) {
    const statementRef = doc(this.db, `waterfall/${statement.waterfallId}/statements/${statement.id}`);
    write.update(statementRef,
      '_meta.updatedBy', this.authService.uid,
      '_meta.updatedAt', new Date(),
    );
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

  /**
   * Initialize a new Statement and return its id
   * @param config 
   * @returns 
   */
  public initStatement(config: CreateStatementConfig): Promise<string> {
    const standalone = isStandaloneVersion(config.waterfall, config.versionId);
    let statement: Statement;
    switch (config.type) {
      case 'mainDistributor':
      case 'salesAgent': {
        statement = createDistributorStatement({
          id: this.createId(),
          contractId: config.contractId,
          senderId: config.rightholderId,
          receiverId: config.producerId,
          waterfallId: config.waterfall.id,
          duration: config.duration,
          type: config.type,
          standalone
        });
        break;
      }
      case 'directSales': {
        statement = createDirectSalesStatement({
          id: this.createId(),
          senderId: config.producerId,
          receiverId: config.producerId,
          waterfallId: config.waterfall.id,
          duration: config.duration,
          standalone
        });
        break;
      }
      case 'producer': {
        statement = createProducerStatement({
          id: this.createId(),
          contractId: config.contractId,
          senderId: config.producerId,
          receiverId: config.rightholderId,
          waterfallId: config.waterfall.id,
          incomeIds: config.incomeIds,
          duration: config.duration,
          standalone
        });
        break;
      }
    }

    if (statement.standalone) statement.versionId = config.versionId;
    return this.add(statement, { params: { waterfallId: config.waterfall.id } });
  }
}
