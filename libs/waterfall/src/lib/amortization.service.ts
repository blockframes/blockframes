import { Injectable } from '@angular/core';
import { DocumentSnapshot, doc } from '@firebase/firestore';
import { createAmortization, Amortization } from '@blockframes/model';
import { BlockframesSubCollection } from '@blockframes/utils/abstract-service';
import { WriteOptions } from 'ngfire';
import { AuthService } from '@blockframes/auth/service';

@Injectable({ providedIn: 'root' })
export class AmortizationService extends BlockframesSubCollection<Amortization> {
  readonly path = 'waterfall/:waterfallId/amortizations';

  constructor(private authService: AuthService) {
    super();
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Amortization>) {
    if (!snapshot.exists()) return undefined;
    const amortization = super.fromFirestore(snapshot);
    return createAmortization(amortization);
  }

  onCreate(amortization: Amortization, { write }: WriteOptions) {
    if (!amortization.waterfallId) return;
    const ref = this.getRef(amortization.id, { waterfallId: amortization.waterfallId });
    write.update(ref, '_meta.createdBy', this.authService.uid);
    write.update(ref, '_meta.createdAt', new Date());
  }

  onUpdate(amortization: Amortization, { write }: WriteOptions) {
    if (!amortization.waterfallId) return;
    const amortizationRef = doc(this.db, `waterfall/${amortization.waterfallId}/amortizations/${amortization.id}`);
    write.update(amortizationRef,
      '_meta.updatedBy', this.authService.uid,
      '_meta.updatedAt', new Date(),
    );
  }

}
