import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Right, Waterfall, createRight, getDefaultVersionId } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';

function convertRightsTo(rights: Right[], versionId: string, defaultVersionId: string) {
  if (!versionId || !defaultVersionId) return rights;
  return rights.map(r => {
    if (!r.version || !r.version[defaultVersionId]) r.version[defaultVersionId] = { conditions: r.conditions, percent: r.percent };
    if (!r.version[versionId]) r.version[versionId] = { conditions: r.conditions, percent: r.percent };
    const version = r.version[versionId];
    if (version?.conditions) r.conditions = version.conditions;
    if (version?.percent !== undefined) r.percent = version.percent;
    return r;
  });
}

@Injectable({ providedIn: 'root' })
export class RightService extends BlockframesSubCollection<Right> {
  readonly path = 'waterfall/:waterfallId/rights';

  protected override fromFirestore(snapshot: DocumentSnapshot<Right>) {
    if (!snapshot.exists()) return undefined;
    const block = super.fromFirestore(snapshot);
    return createRight(block);
  }

  public rightsChanges(waterfall: Waterfall, versionId: string) {
    return this.valueChanges({ waterfallId: waterfall.id }).pipe(
      map(rights => convertRightsTo(rights, versionId, getDefaultVersionId(waterfall)))
    );
  }

  public async rights(waterfall: Waterfall, versionId?: string) {
    const rights = await this.getValue({ waterfallId: waterfall.id });
    return convertRightsTo(rights, versionId, getDefaultVersionId(waterfall));
  }

}
