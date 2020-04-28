import { Component, ChangeDetectionStrategy, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { BehaviorSubject, Subscription } from 'rxjs';
import { combineLatest } from 'rxjs';
import { startWith, filter, tap } from 'rxjs/operators';

declare const jwplayer: any;

@Component({
  selector: 'event-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlayerComponent implements OnInit, OnDestroy, AfterViewInit {

  private loaded = new BehaviorSubject(false);
  private afterView = new BehaviorSubject(false);
  private sub: Subscription;
  private player: any;

  constructor(
    private eventQuery: EventQuery,
    private functions: AngularFireFunctions,
  ) {}

  ngOnInit() {
    // listen for when the script is loaded AND the component html exists
    this.sub = combineLatest([this.loaded, this.afterView]).pipe(
      startWith([false, false]),
      filter(([loaded, afterView]) => loaded && afterView),
      tap(() => this.initPlayer())
    ).subscribe();

    // start loading the script
    this.loadScript();
  }

  loadScript() {
    const id = 'jwplayer-script';

    // check if the script tag already exists
    if (!document.getElementById(id)) {
      const script = document.createElement('script');
      script.setAttribute('id', id);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', 'https://cdn.jwplayer.com/libraries/lpkRdflk.js');
      document.head.appendChild(script);
      script.onload = () => {
        this.loaded.next(true);
      }
    } else {
      this.loaded.next(true); // already loaded
    }
  }

  ngAfterViewInit() {
    this.afterView.next(true);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async initPlayer() {
    const { id } = this.eventQuery.getActive();

    const callDeploy = this.functions.httpsCallable('privateVideo');
    const { error, result } = await callDeploy({ eventId: id }).toPromise();

    if (!!error) {
      console.log('ERROR');
    } else {
      this.player = jwplayer('player');
      this.player.setup({file: result});
    }
  }
}
