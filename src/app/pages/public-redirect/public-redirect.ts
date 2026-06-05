import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-redirect',
  imports: [],
  templateUrl: './public-redirect.html',
  styleUrl: './public-redirect.scss',
})
export class PublicRedirect {
  private router = inject(Router);

  constructor() {
    const classHash = localStorage.getItem('classHash');
    if (classHash) {
      this.router.navigate([`/public/calendar/${classHash}`], { replaceUrl: true }).then();
    }
  }
}
