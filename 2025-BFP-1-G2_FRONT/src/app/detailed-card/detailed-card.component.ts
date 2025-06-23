import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface Candidate {
  name: string;
  surname1: string;
  surname2: string;
  email: string;
  phoneNumber: string;
  date: string;
  valid: boolean | null;
}

export interface DetailedCardData {
  id: string | number;
  title: string;
  titleLabel?: string;
  subtitle?: string;
  subtitleLabel?: string;
  content: string;
  contentLabel?: string;
  actions?: DetailedCardAction[];
  metadata?: { [key: string]: any };
  candidates?: any[];
  editable?: boolean;
}

export interface DetailedCardAction {
  label: string;
  action: string;
  color?: 'primary' | 'accent' | 'warn';
  icon?: string;
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
  @Input() editMode: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<{ action: string, data: any }>();
  @Output() onNavigate = new EventEmitter<number>();
  @Output() onSave = new EventEmitter<DetailedCardData>();

  currentItem: DetailedCardData | null = null;
  editedItem: DetailedCardData | null = null;
  panelOpenState: boolean = false;
  isEditing: boolean = false;

  ngOnInit() {
    this.updateCurrentItem();
  }

  ngOnChanges() {
    this.updateCurrentItem();
  }

  updateCurrentItem() {
    if (this.data.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.data.length) {
      this.panelOpenState = false;
      this.currentItem = this.data[this.currentIndex];
      this.editedItem = { ...this.currentItem };
    }
  }

  trackByMetadata(index: number, item: any): any {
    return item.key;
  }
  
  startEdit() {
    this.isEditing = true;
    this.editedItem = { ...this.currentItem! };
    if (this.currentItem!.metadata) {
      this.editedItem!.metadata = { ...this.currentItem!.metadata };
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editedItem = { ...this.currentItem! };
  }

  saveEdit() {
    if (this.editedItem) {
      this.onSave.emit(this.editedItem);
      this.currentItem = { ...this.editedItem };
      this.isEditing = false;
    }
  }

  close() {
    if (this.isEditing) {
      this.cancelEdit();
    }
    this.onClose.emit();
  }

  navigatePrevious() {
    if (this.isEditing) {
      this.cancelEdit();
    }
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
    }
  }

  navigateNext() {
    if (this.isEditing) {
      this.cancelEdit();
    }
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

  aceptCandidate(candidate: Candidate) {
    if (this.currentItem && this.currentItem.candidates && this.currentItem.candidates.length > 0) {
      this.onAction.emit({
        action: 'accept',
        data: {
          candidate: candidate,
          offerId: this.currentItem.id
        }
      });
    }
  }

  rejectCandidate(candidate: Candidate) {
    if (this.currentItem && this.currentItem.candidates && this.currentItem.candidates.length > 0) {
      this.onAction.emit({
        action: 'reject',
        data: {
          candidate: candidate,
          offerId: this.currentItem.id
        }
      });
    }
  }

  deleteOptionCandidate(candidate: Candidate) {
    if (this.currentItem && this.currentItem.candidates && this.currentItem.candidates.length > 0) {
      this.onAction.emit({
        action: 'deleteOption',
        data: {
          candidate: candidate,
          offerId: this.currentItem.id
        }
      });
    }
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