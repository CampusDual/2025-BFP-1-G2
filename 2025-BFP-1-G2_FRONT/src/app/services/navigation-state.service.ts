import { Injectable } from '@angular/core';


interface NavigationState {
  component: string;
  data: any;
  route: string;
  params?: any;
  queryParams?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationStateService {
  private currentState: NavigationState | null = null;

  saveState(state: NavigationState) {
    this.currentState = { ...state };
  }

  getState(): NavigationState | null {
    return this.currentState;
  }

  clearState() {
    this.currentState = null;
  }

  hasState(): boolean {
    return this.currentState !== null;
  }
}