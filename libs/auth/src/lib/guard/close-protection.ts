import { Observable } from "rxjs";

export interface CloseProtection {

  /** check if the auth state is flaged (*i.e. isKeyStored = false*) */
  isFlaged(): boolean | Observable<boolean>;

  /** should `@HostListener('window:beforeunload', ['$event'])` and prevent user to leave the app */
  unloadNotification($event: any);
}