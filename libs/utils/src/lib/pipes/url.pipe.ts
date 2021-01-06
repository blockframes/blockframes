import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { HttpParams } from '@angular/common/http';

@Pipe({ name: 'getLink', pure: true })
export class GetLinkPipe implements PipeTransform {
  transform(link: string, fallback?: string) {
    const url =  formatUrl(link).url;
    return url || fallback;
  }
}

@Pipe({ name: 'getParams', pure: true })
export class GetParamsPipe implements PipeTransform {
  transform(link: string) {
    return formatUrl(link).params
  }
}

@NgModule({
  declarations: [GetLinkPipe, GetParamsPipe],
  exports: [GetLinkPipe, GetParamsPipe]
})
export class GetLinkModule { }

function formatUrl(_url: string) {
  let params = {};
  if (_url.includes('?')) {
    const httpParams = new HttpParams({ fromString: _url.split('?')[1] });
    httpParams.keys().forEach(k => {
      params[k] = httpParams.get(k)
    });
  }

  return {
    url: _url.split('?')[0],
    params
  }
}
