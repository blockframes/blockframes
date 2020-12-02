// Angular
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
// RxJs
import { Observable } from 'rxjs';

// env
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AngularFirestore } from '@angular/fire/firestore';

interface PageSection {
  sections: {
    _type: string;
  }
}

@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  @HostBinding('test-id="content"') testId
  public page$: Observable<PageSection>;

  constructor(
    private dynTitle: DynamicTitleService,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Home');
    this.page$ = this.db.doc<PageSection>('cms/festival/home/live').valueChanges();
  }
}
