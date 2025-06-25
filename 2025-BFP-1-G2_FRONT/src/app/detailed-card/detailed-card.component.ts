import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';

export interface Candidate {
  name: string;
  surname1: string;
  surname2: string;
  email: string;
  phoneNumber: string;
  date: string;
  Linkedin?: string;
  dateAdded: string;
  valid: boolean | null;
}

export interface DetailedCardData {
  id: number | string;
  title: string;
  editableTitle?: string;
  titleLabel?: string;
  subtitle?: string;
  subtitleLabel?: string;
  content: string;
  contentLabel?: string;
  editable?: boolean;
  form?: FormGroup;
  metadata?: { [key: string]: any };
  candidates?: any[];
  actions?: DetailedCardAction[];
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
  addingNewItem: boolean = false;
  maxDate: Date = new Date(); // Fecha máxima será la actual
  minDate: Date = new Date(1800, 0, 1); // Fecha mínima será el año 1800
  private fb: any;


  ngOnInit() {
    this.updateCurrentItem();
  }

  ngOnChanges() {
    this.updateCurrentItem();
  }

  updateCurrentItem() {
    if (this.data.length > 0) {
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      } else if (this.currentIndex >= this.data.length) {
        this.currentIndex = this.data.length - 1;
      }

      this.currentItem = this.data[this.currentIndex];
      this.editedItem = { ...this.currentItem };

      this.addingNewItem = this.currentItem.id === 0 && !this.currentItem.title;
      this.isEditing = this.addingNewItem;
      this.panelOpenState = false;
    }
  }

  startEdit() {
    if (!this.addingNewItem) {
      this.isEditing = true;
      this.editedItem = { ...this.currentItem! };
      if (this.currentItem!.metadata) {
        this.editedItem!.metadata = { ...this.currentItem!.metadata };
      }
    }
  }

  cancelEdit() {
    if (this.addingNewItem) {
      this.close();
    } else {
      this.isEditing = false;
      this.editedItem = { ...this.currentItem! };
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.isEditing) {
        this.saveEdit();
      }
      else if (this.currentItem?.editable) {
        this.startEdit();
      }
    }
    else if (event.key === 'Escape') {
      event.preventDefault();
      if (this.isEditing) {
        this.cancelEdit();
      }
      else if (this.addingNewItem) {
        this.close();
      }
      else this.close();
    }
    else if (event.key === 'ArrowLeft' && this.showNavigation && !this.isEditing) {
      event.preventDefault();
      this.navigatePrevious();
    }
    else if (event.key === 'ArrowRight' && this.showNavigation && !this.isEditing) {
      event.preventDefault();
      this.navigateNext();
    }
  }

  private createCompanyForm(): FormGroup {
    return this.fb.group({
      // ... otros campos
      foundedDate: ['', [
        Validators.required,
        this.dateValidator()
      ]]
    });
  }

  private dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = control.value;
      if (!date) {
        return null;
      }

      const minDate = new Date(1800, 0, 1);
      const maxDate = new Date();

      if (date < minDate) {
        return { 'matDatepickerMin': true };
      }
      if (date > maxDate) {
        return { 'matDatepickerMax': true };
      }

      return null;
    };
  }

  saveEdit() {
    if (this.editedItem && this.editedItem.form) {
      const formValue = this.editedItem.form.value;

      // Convertir la fecha a timestamp si es necesario
      if (formValue.foundedDate) {
        const date = new Date(formValue.foundedDate);
        formValue.foundedDate = date.getFullYear();
      }

      this.onSave.emit({
        ...this.editedItem,
        form: this.editedItem.form
      });
    }
  }

  close() {
    this.isEditing = false;
    this.addingNewItem = false;
    this.panelOpenState = false;
    this.onClose.emit();
  }

  navigatePrevious() {
    if (!this.addingNewItem && this.canNavigatePrevious) {
      this.isEditing = false;
      this.currentIndex--;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
    }
  }

  navigateNext() {
    if (!this.addingNewItem && this.canNavigateNext) {
      this.isEditing = false;
      this.currentIndex++;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
    }
  }

  get canNavigatePrevious(): boolean {
    return !this.addingNewItem && this.currentIndex > 0;
  }

  get canNavigateNext(): boolean {
    return !this.addingNewItem && this.currentIndex < this.data.length - 1;
  }

  get currentPosition(): string {
    if (this.addingNewItem) {
      return 'Nueva empresa';
    }
    return `${this.currentIndex + 1} de ${this.data.length}`;
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

}
