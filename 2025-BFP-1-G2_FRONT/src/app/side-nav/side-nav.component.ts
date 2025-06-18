import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent{
  showFiller = false;

  constructor(private router: Router) { }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  collapsedSideBar(){
    this.showFiller = !this.showFiller;
    const sidenav = document.querySelector('mat-drawer-container');
    sidenav?.classList.toggle('collapsed');
  }
}
