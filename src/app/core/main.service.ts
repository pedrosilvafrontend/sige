import { inject, Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { Breakpoint } from '@models/breakpoint.model';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private breakpointObserver = inject(BreakpointObserver);
  public breakpoints$ = new BehaviorSubject<Breakpoint>({
    handset: false,
    handsetPortrait: false,
    handsetLandscape: false,
    tablet: false,
    tabletPortrait: false,
    tabletLandscape: false,
    web: false,
    webPortrait: false,
    webLandscape: false,
  });

  constructor() {
    this.breakpointsObserver();
  }

  breakpointsObserver() {
    this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.HandsetPortrait,
      Breakpoints.HandsetLandscape,
      Breakpoints.Tablet,
      Breakpoints.TabletPortrait,
      Breakpoints.TabletLandscape,
      Breakpoints.Web,
      Breakpoints.WebPortrait,
      Breakpoints.WebLandscape,
      // '(orientation: portrait)',
      // '(orientation: landscape)',
    ]).subscribe(result => {
      // console.log('breakpointObserver: ', result);
      this.breakpoints$.next({
        handset: result.breakpoints[Breakpoints.Handset],
        handsetPortrait: result.breakpoints[Breakpoints.HandsetPortrait],
        handsetLandscape: result.breakpoints[Breakpoints.HandsetLandscape],
        tablet: result.breakpoints[Breakpoints.Tablet],
        tabletPortrait: result.breakpoints[Breakpoints.TabletPortrait],
        tabletLandscape: result.breakpoints[Breakpoints.TabletLandscape],
        web: result.breakpoints[Breakpoints.Web],
        webPortrait: result.breakpoints[Breakpoints.WebPortrait],
        webLandscape: result.breakpoints[Breakpoints.WebLandscape],
      })

    });
  }

}
