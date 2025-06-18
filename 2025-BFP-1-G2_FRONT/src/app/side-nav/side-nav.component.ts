import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  shouldRun = false;
  showFiller = false;
  isCandidate = false;
  isCompany = false;
  isAuthenticated = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Aquí deberías obtener el estado de autenticación y el rol del usuario
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.isAuthenticated = true; // Ejemplo
    this.isCandidate = true; // o this.isCompany = true;
    this.shouldRun = this.isAuthenticated;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  collapsedSideBar(){
    this.showFiller = !this.showFiller;
    const sidenav = document.querySelector('mat-drawer-container');
    sidenav?.classList.toggle('collapsed');
  }
}
