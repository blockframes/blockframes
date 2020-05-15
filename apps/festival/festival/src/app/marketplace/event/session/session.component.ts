import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EventService, Event } from '@blockframes/event/+state';
import { pluck, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit {

  event$: Observable<Event>;
  url: SafeResourceUrl;
  public showSession = true;

  constructor(
    private service: EventService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap(eventId => this.service.queryDocs(eventId))
    );
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/391939808');
  }

  playVideo() {
    this.showSession = false;
    return;
  }
}
