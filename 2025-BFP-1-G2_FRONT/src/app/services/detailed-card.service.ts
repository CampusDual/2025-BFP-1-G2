import { Injectable } from '@angular/core';
import { NavigationStateService } from './navigation-state.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailedCardService {
  private restoreStateSubject = new Subject<any>();
  public restoreState$ = this.restoreStateSubject.asObservable();

  constructor(
    private navigationStateService: NavigationStateService,
    private router: Router
  ) { }

  requestRestore() {
    const savedState = this.navigationStateService.getState();
    if (savedState && savedState.component === 'detailed-card') {
      this.restoreStateSubject.next(savedState.data);
      this.navigationStateService.clearState();
    }
  }

  hasState(): boolean {
    return this.navigationStateService.hasState();
  }


}