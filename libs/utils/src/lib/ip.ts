import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IpService {
  private api = 'https://api.ipify.org/?format=json';
  constructor(private http: HttpClient) {}

  public get(): Promise<string> {
    return firstValueFrom(this.http
      .get<{ ip: string }>(this.api))
      .then(data => data.ip)
      .catch(() => 'unknown');
  }
}
