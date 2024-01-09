import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@firebase/firestore';
import { Right, Version, Waterfall, createRight, getDefaultVersionId } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { map } from 'rxjs';

function convertRightsTo(rights: Right[], version: Version, defaultVersionId: string) {
  if (!version?.id || !defaultVersionId) return rights;
  if (version.standalone) return rights.filter(r => r.version[version.id]);
  return rights.filter(r => !Object.values(r.version).some(v => v.standalone)).map(r => {
    if (!r.version) r.version = {};
    if (!r.version[defaultVersionId]) r.version[defaultVersionId] = { conditions: r.conditions, percent: r.percent };
    if (!r.version[version.id]) r.version[version.id] = { conditions: r.conditions, percent: r.percent };
    const rightVersion = r.version[version.id];
    if (rightVersion?.conditions) r.conditions = rightVersion.conditions;
    if (rightVersion?.percent !== undefined) r.percent = rightVersion.percent;
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
      map(rights => convertRightsTo(rights, waterfall.versions.find(v => v.id === versionId), getDefaultVersionId(waterfall)))
    );
  }

  public async rights(waterfall: Waterfall, versionId?: string) {
    const rights = await this.getValue({ waterfallId: waterfall.id });
    return convertRightsTo(rights, waterfall.versions.find(v => v.id === versionId), getDefaultVersionId(waterfall));
  }

}
