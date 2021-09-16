import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventService } from '@blockframes/event/+state';
import { Subscription } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
@Component({
  selector: 'festival-event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  animations: [slideUpList('h2, mat-card')],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  private formSub: Subscription;
  form: EventForm;

  constructor(
    private service: EventService,
    private route: ActivatedRoute,

    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    // @TODO #5895 clean or can be removed entierely ? => Bruce
    const eventId$ = this.route.params.pipe(pluck('eventId'));



    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {

      this.form = new EventForm(event);

      // FormArray (used in FormList) does not mark as dirty on push,
      // so we do it manually to enable the save button
      // more info : https://github.com/angular/angular/issues/16370
      if (this.formSub) {
        this.formSub.unsubscribe();
        delete this.formSub;
      }
      this.formSub = this.form.meta.valueChanges.subscribe(() => this.form.markAsDirty());

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formSub.unsubscribe();
  }

}
