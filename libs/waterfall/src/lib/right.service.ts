import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Right, createRight } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';

function convertRightsTo(rights: Right[], versionId: string) {
  if (!versionId) return rights;
  return rights.map(r => {
    const version = (r.version && r.version[versionId] !== undefined) ? r.version[versionId] : undefined;
    const right = r;
    if (version?.conditions) right.conditions = version.conditions;
    if (version?.percent) right.percent = version.percent;
    if (version?.nextIds) right.nextIds = version.nextIds;
    if (version?.pools) right.pools = version.pools;
    if (version?.groupId) right.groupId = version.groupId;
    return right
  }).filter(r => !r.version || !r.version[versionId] || !r.version[versionId].deleted);
}

@Injectable({ providedIn: 'root' })
export class RightService extends BlockframesSubCollection<Right> {
  readonly path = 'waterfall/:waterfallId/rights';

  protected override fromFirestore(snapshot: DocumentSnapshot<Right>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createRight(block);
  }

  public rightsChanges(waterfallId: string, versionId: string) {
    return this.valueChanges({ waterfallId }).pipe(
      map(rights => convertRightsTo(rights, versionId))
    );
  }

  public async rights(waterfallId: string, versionId?: string) {
    const rights = await this.getValue({ waterfallId });
    return convertRightsTo(rights, versionId);
  }

}
