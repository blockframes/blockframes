import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { HostedMediaForm } from '@blockframes/media/form/media.form';
import { Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { HostedMediaFormValue } from '@blockframes/media/+state/media.firestore';

@Component({
  selector: 'festival-title-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleUploadComponent implements OnInit {

  form = new HostedMediaForm();
  storagePath = ''

  uploadDisabled$: Observable<boolean>;

  constructor(
    private dynTitle: DynamicTitleService,
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Upload Movie');

    this.uploadDisabled$ = this.form.valueChanges.pipe(
      tap(a => console.log(a)), // TODO REMOVE DEBUG LOG
      map((formValues: HostedMediaFormValue) => !formValues.blobOrFile),
      startWith(true),
    );
  }

}
