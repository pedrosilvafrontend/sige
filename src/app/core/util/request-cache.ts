import { of } from 'rxjs';

export class RequestCache<T> {
  private cache = new Map<string, T>();

  setCache(key: string, data: T) {
    this.cache.set(key, data);
  }

  getCache(url: string, params: any): T | null {
    const cacheKey = this.createCacheKey(url, params);
    return this.getCacheByKey(cacheKey);
  }

  getCacheByKey(key: string): T | null {
    const data = this.cache.get(key);
    return data || null;
  }
  deleteCache(key: string) {
    this.cache.delete(key);
  }

  // intercept(req: HttpRequest<T>, next: HttpHandler): Observable<T> {
  //
  //   const cacheKey = this.createCacheKey(req.urlWithParams, req.body);
  //   const cachedResponse = this.getCache(cacheKey);
  //   if (cachedResponse) {
  //     return of(cachedResponse);// Return cached response if available
  //   }
  //
  //   return next.handle(req).pipe(
  //     tap((event) => {
  //       if (event instanceof HttpResponse) {
  //         if (canCacheRequest(req)) this.setCache(cacheKey, {data : event , maxAge: 90000});
  //       }
  //     })
  //   );
  // }

  private createCacheKey(url: string, body: T): string {
    const bodyHash = this.simpleHash(JSON.stringify(body)).toString(); // with hash we can do it with only small key

    return `${url}_${bodyHash}`;
  }

  /** Generates a Hash to be appended with key */
  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
}
