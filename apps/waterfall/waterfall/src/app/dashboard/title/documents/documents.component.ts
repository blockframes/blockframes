
// External
// import { FormControl } from '@angular/forms';
// import { arrayUnion } from 'firebase/firestore';
// import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
// import { BehaviorSubject, Observable, Subscription, combineLatest, map, switchMap, tap } from 'rxjs';


// Blockframes
// import { Waterfall, WaterfallAmendment, WaterfallDocument, WaterfallFile } from '@blockframes/model';
// import { OrganizationService } from '@blockframes/organization/service';
// import { WaterfallFileForm } from '@blockframes/waterfall/form/file.form';
// import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
// import { FileUploaderService } from '@blockframes/media/file-uploader.service';
// import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';


@Component({
  selector: 'waterfall-title-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsComponent implements OnInit, OnDestroy {

  @ViewChild(CardModalComponent) cardModal: CardModalComponent;

  // TODO THIS IS EXPRIMENTAL CODE THAT COULD BE USEFUL FOR IMPLEMENTING THE DOCUMENT SYSTEM
  // TODO DELETE THAT LATER issue #9389
  ngOnInit(): void {
    return; // nothing
  }
  ngOnDestroy(): void {
    return; // nothing
  }

  // movieId: string;
  // waterfall$: Observable<Waterfall>;
  // documents$: Observable<unknown[]>;
  // members$: Observable<{ name: string, id: string }[]>;

  // fakeOrgName = new FormControl('');

  // newDocumentId: string;
  // fileForm:WaterfallFileForm;
  // documentType = new FormControl('contract');
  // licensor = new FormControl({ name: '', id: '' });
  // licensee = new FormControl({ name: '', id: '' });
  // folder = new FormControl('');
  // dummyValue = new FormControl('');
  // parentDocument = new FormControl(undefined);
  // creating$ = new BehaviorSubject(false);
  // parentDocSubscription?: Subscription;

  // constructor(
  //   private route: ActivatedRoute,
  //   private waterfallService: WaterfallService,
  //   private uploaderService: FileUploaderService,
  //   private organizationService: OrganizationService,
  //   private documentsService: WaterfallDocumentsService,
  // ) {
  //   this.movieId = this.route.snapshot.params.movieId;
  //   this.newDocumentId = this.documentsService.createId();
  //   this.fileForm = new WaterfallFileForm({ id: this.newDocumentId });
  // }

  // ngOnInit() {
  //   this.waterfall$ = this.waterfallService.valueChanges(this.movieId);
  //   const subDocs$ = this.documentsService.valueChanges({ waterfallId: this.movieId });
  //   this.documents$ = combineLatest([
  //     this.waterfall$,
  //     subDocs$,
  //   ]).pipe(
  //     map(([waterfall, docs]) => { // merge WaterfallFile and (WaterfallDocument & WaterfallAmendment)
  //       return waterfall.documents.map(file => ({
  //         ...file,
  //         ...docs.find(d => d.id === file.id),
  //       }));
  //     }),
  //     map(docs => { // merge Amendment into their root parent document
  //       const amendments = docs.filter(doc => doc.type === 'amendment') as (WaterfallAmendment & WaterfallFile)[];
  //       const contracts = docs.filter(doc => doc.type !== 'amendment') as (WaterfallDocument & WaterfallFile)[];

  //       const rootToChildren: Record<string, (WaterfallAmendment & WaterfallFile)[]> = {};
  //       amendments.forEach(am => {
  //         const children: (WaterfallAmendment & WaterfallFile)[] = [am];

  //         for (let i = 0 ; i < 200 ; i++) {

  //           const current = children[i];
  //           if (!current) break;

  //           const parent = docs.find(doc => doc.id === current.parentId);
  //           if (!parent) break;

  //           if (parent.type !== 'amendment') {
  //             rootToChildren[parent.id] ||= [];
  //             if (rootToChildren[parent.id].length < children.length) {
  //               rootToChildren[parent.id] = children;
  //             }
  //           } else { 
  //             children.push(parent as (WaterfallAmendment & WaterfallFile));
  //           }
  //         }
  //       });

  //       return contracts.map(doc => {
  //         const children = rootToChildren[doc.id] ?? [];
  //         const targetId = children[0]?.id ?? doc.id;
  //         return { ...doc, children, targetId };
  //       });
  //     }),
  //     tap(console.log),
  //   );

  //   const realOrg$ = this.waterfall$.pipe(
  //     switchMap(waterfall => this.organizationService.valueChanges(waterfall.orgIds)),
  //   );
    
  //   this.members$ = combineLatest([
  //     realOrg$,
  //     this.waterfall$,
  //   ]).pipe(
  //     map(([realOrgs, waterfall]) => {
  //       const real = realOrgs.map(org => ({ name: org.name, id: org.id }));
  //       const fake = waterfall.fakeOrgs.map(name => ({ name, id: 'fake' }));
  //       return [...real, ...fake, ];
  //     }),
  //   );

  //   this.parentDocSubscription = this.parentDocument.valueChanges.subscribe(doc => {
  //     if (!doc) return;
  //     this.dummyValue.setValue(doc.meta);
  //   });
  // }

  // ngOnDestroy() {
  //   this.parentDocSubscription?.unsubscribe();
  // }

  // async createFakeOrg() {
  //   if (!this.fakeOrgName.value) return;

  //   await this.waterfallService.update({ id: this.movieId, fakeOrgs: arrayUnion(this.fakeOrgName.value) });
  //   this.fakeOrgName.setValue('');
  // }

  // compareOrgWith(option: { name: string, id: string }, value: { name: string, id: string }) {
  //   return option.name === value.name;
  // }

  // async createDocument() {
  //   this.creating$.next(true);

  //   if (this.documentType.value === 'amendment') {
  //     this.documentsService.add<WaterfallAmendment>({
  //       id: this.newDocumentId,
  //       type: 'amendment',
  //       waterfallId: this.movieId,
  //       parentId: this.parentDocument.value.targetId,
  //       meta: this.dummyValue.value,
  //     }, { params: { waterfallId: this.movieId } });
  //   } else {
  //     this.documentsService.add<WaterfallDocument>({
  //       id: this.newDocumentId,
  //       folder: this.folder.value,
  //       waterfallId: this.movieId,
  //       type: this.documentType.value as any,
  //       ownerId: this.organizationService.org.id,
  //       sharedWith: [],
  //       meta: this.dummyValue.value,
  //       licensor: this.licensor.value,
  //       licensee: this.licensee.value,
  //     }, { params: { waterfallId: this.movieId } });
  //   }

  //   this.uploaderService.upload();

  //   // reset
  //   this.newDocumentId = this.documentsService.createId();
  //   this.fileForm = new WaterfallFileForm({ id: this.newDocumentId });
  //   this.documentType.setValue('contract');
  //   this.folder.setValue('');
  //   this.dummyValue.setValue('');
  //   this.licensor.setValue({ id: '', name: '' });
  //   this.licensee.setValue({ id: '', name: '' });
  //   this.parentDocument.setValue(undefined);

  //   this.creating$.next(false);
  // }


}
