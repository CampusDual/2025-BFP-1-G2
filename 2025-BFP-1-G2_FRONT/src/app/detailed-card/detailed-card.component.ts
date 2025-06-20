import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { User } from '../auth/services/auth.service';


export interface DetailedCardData {
  id: string | number;
  title: string;
  subtitle?: string;
  content: string;
  actions?: DetailedCardAction[];
  metadata?: { [key: string]: any };
  candidates?: any[];
}

export interface DetailedCardAction {
  label: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string; // Nuevo campo para íconos
  data?: any;
}

@Component({
  selector: 'app-detailed-card',
  templateUrl: './detailed-card.component.html',
  styleUrls: ['./detailed-card.component.css']
})
export class DetailedCardComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() data: DetailedCardData[] = [];
  @Input() currentIndex: number = 0;
  @Input() showNavigation: boolean = true;
  @Input() cardType: 'offer' | 'candidate' | 'generic' = 'generic';

  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<{action: string, data: any}>();
  @Output() onNavigate = new EventEmitter<number>();

  currentItem: DetailedCardData | null = null;
  
  ngOnInit() {
    this.updateCurrentItem();
  }

  ngOnChanges() {
    this.updateCurrentItem();
  }

  updateCurrentItem() {
    if (this.data.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.data.length) {
      this.currentItem = this.data[this.currentIndex];
    }
  }

  close() {
    this.onClose.emit();
  }

  navigatePrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
    }
  }

  navigateNext() {
    if (this.currentIndex < this.data.length - 1) {
      this.currentIndex++;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
    }
  }

  executeAction(action: DetailedCardAction) {
    this.onAction.emit({
      action: action.action,
      data: { ...action.data, currentItem: this.currentItem }
    });
  }

  get canNavigatePrevious(): boolean {
    return this.currentIndex > 0;
  }

  get canNavigateNext(): boolean {
    return this.currentIndex < this.data.length - 1;
  }

  get currentPosition(): string {
    return `${this.currentIndex + 1} de ${this.data.length}`;
  }
}
