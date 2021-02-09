import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { HttpParams } from '@angular/common/http';

@Pipe({ name: 'getLink' })
export class GetLinkPipe implements PipeTransform {
  transform(link: string, fallback?: string) {
    return formatUrl(link).url || fallback
  }
}

@Pipe({ name: 'getParams' })
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

function formatUrl(path: string) {
  const params = {};
  if (path) {
    const [url, paramsUrl = ''] = path.split('?');
    const httpParams = new HttpParams({ fromString: paramsUrl });
    for (const key of httpParams.keys()) {
      params[key] = httpParams.get(key);
    }
    return { url, params }
  }
  return {}
}
