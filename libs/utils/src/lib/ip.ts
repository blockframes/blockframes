import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";


@Injectable({ providedIn: 'root' })
export class IpService {
  private api = 'https://api.ipify.org/?format=json';
  constructor(private http: HttpClient) {}

  public get(): Promise<string> {
    return this.http.get<{ ip: string }>(this.api)
    .toPromise()
    .then(data => {
      return data.ip;
    });
  }

}


