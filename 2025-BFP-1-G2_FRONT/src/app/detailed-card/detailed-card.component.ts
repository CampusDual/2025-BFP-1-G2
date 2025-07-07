import { Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';
import {DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter} from "@angular/material/core";
import {MatDatepicker} from "@angular/material/datepicker";
import { Tag } from '../admin/admin-dashboard/admin-dashboard.component';

export interface Candidate {
  login: string;
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
  tags?: Tag[];
}

export interface DetailedCardAction {
  label: string;
  action: string;
  color?: string;
  icon?: string;
  data?: any;
}

const YEAR_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date): string {
    return date ? date.getFullYear().toString() : '';
  }

  override parse(value: string): Date | null {
    const year = parseInt(value, 10);
    return isNaN(year) ? null : new Date(year, 0, 1);
  }
}

@Component({
  selector: 'app-detailed-card',
  templateUrl: './detailed-card.component.html',
  styleUrls: ['./detailed-card.component.css'],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: YEAR_FORMATS },
  ],
})
export class DetailedCardComponent implements OnInit, AfterViewInit {

  @Input() isVisible: boolean = false;
  @Input() data: DetailedCardData[] = [];
  @Input() currentIndex: number = 0;
  @Input() showNavigation: boolean = true;
  @Input() cardType: 'company' | 'offer' | 'candidate' | 'generic' = 'generic';
  @Input() editMode: boolean = false;
  @Input() availableTags: Tag[] = [];

  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<{ action: string, data: any }>();
  @Output() onNavigate = new EventEmitter<number>();
  @Output() onSave = new EventEmitter<DetailedCardData>();

  @ViewChild('foundedDatePicker') foundedDatePicker!: MatDatepicker<Date>;
  @ViewChild('navigationDotsWrapper', { static: false }) navigationDotsWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('navigationDots', { static: false }) navigationDots!: ElementRef<HTMLDivElement>;
  startYear = new Date();

  currentItem: DetailedCardData | null = null;
  editedItem: DetailedCardData | null = null;
  panelOpenState: boolean = false;
  isEditing: boolean = false;
  addingNewItem: boolean = false;
  maxDate: Date = new Date();
  minDate: Date = new Date(1800, 0, 1);

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
            setTimeout(() => {
        this.scrollToActiveDot();
      }, 50);
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

  onChipKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === 'Escape' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.stopPropagation();
    }
  }



  saveEdit() {
    if (this.editedItem?.form) {
      const formValue = this.editedItem.form.value;
      if (formValue.foundedDate instanceof Date) {
        formValue.foundedDate = formValue.foundedDate.getFullYear();
      }
      this.onSave.emit({...this.editedItem, form: this.editedItem.form});
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
      this.scrollToActiveDot();
    }
  }

  navigateNext() {
    if (!this.addingNewItem && this.canNavigateNext) {
      this.isEditing = false;
      this.currentIndex++;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
      this.scrollToActiveDot();
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
  yearSelected(normalizedYear: Date) {
    const ctrl = this.currentItem?.form?.get('foundedDate');
    if (ctrl) {
      ctrl.setValue(new Date(normalizedYear.getFullYear(), 0, 1));
      this.foundedDatePicker?.close(); // cierre inmediato
    }
  }

  isTagSelected(tag: Tag, form: FormGroup): boolean {
    const selectedTags = form.get('tags')?.value || [];
    return selectedTags.some((t: Tag) => t.id === tag.id);
  }

  getTagsFormControl(form: FormGroup): FormControl {
    return form.get('tags') as FormControl;
  }

  onChipSelectionChange(event: any): void {
    const selectedTags = event.value as Tag[];
    const currentForm = this.currentItem?.form;

    if (!currentForm) return;

    if (selectedTags) {
      currentForm.get('tags')?.setValue(selectedTags);
    }
  }

  toggleTag(tag: Tag, form: FormGroup): void {
    const tagsControl = form.get('tags');
    if (!tagsControl) return;

    const currentTags = tagsControl.value || [];
    const isSelected = this.isTagSelected(tag, form);

    if (isSelected) {
      const updatedTags = currentTags.filter((t: Tag) => t.id !== tag.id);
      tagsControl.setValue(updatedTags);
    } else {
      if (currentTags.length < 5) {
        const updatedTags = [...currentTags, tag];
        tagsControl.setValue(updatedTags);
      } else {
        const updatedTags = [...currentTags.slice(1), tag];
        tagsControl.setValue(updatedTags);
      }
    }
  }

  getSelectedTagsCount(form: FormGroup): number {
    const selectedTags = form.get('tags')?.value || [];

    if (selectedTags.length > 5) {
      const limitedTags = selectedTags.slice(-5);
      form.get('tags')?.setValue(limitedTags);
      return 5;
    }

    return selectedTags.length;
  }


  compareTagsById = (tag1: Tag, tag2: Tag): boolean => {
    return tag1 && tag2 ? tag1.id === tag2.id : tag1 === tag2;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDotsNavigation();
    }, 200);
  }

  private initializeDotsNavigation(): void {
    if (!this.navigationDots?.nativeElement) return;

    const dotsContainer = this.navigationDots.nativeElement;

    dotsContainer.style.display = 'flex';
    dotsContainer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    dotsContainer.style.willChange = 'transform';
    this.scrollToActiveDot();
  }

  navigateToIndex(index: number): void {
    if (index >= 0 && index < this.data.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
      this.scrollToActiveDot();
    }
  }

  private scrollToActiveDot(): void {
    if (!this.navigationDots?.nativeElement || !this.navigationDotsWrapper?.nativeElement) return;

    const dotsContainer = this.navigationDots.nativeElement;
    const wrapper = this.navigationDotsWrapper.nativeElement;

    const activeDot = dotsContainer.children[this.currentIndex] as HTMLElement;

    if (!activeDot) return;

    const wrapperWidth = wrapper.offsetWidth;
    const dotsContainerWidth = dotsContainer.scrollWidth;

    if (dotsContainerWidth <= wrapperWidth) {
      dotsContainer.style.transform = 'translateX(0px)';
      dotsContainer.style.justifyContent = 'center';
      this.updateContentIndicators(0, 0);
      return;
    }

    dotsContainer.style.justifyContent = 'flex-start';
    const dotPosition = activeDot.offsetLeft;
    const dotWidth = activeDot.offsetWidth;

    const idealPosition = dotPosition - (wrapperWidth / 2) + (dotWidth / 2);
    const maxScroll = dotsContainerWidth - wrapperWidth;
    const targetScroll = Math.max(0, Math.min(idealPosition, maxScroll));

    dotsContainer.style.transform = `translateX(-${targetScroll}px)`;
    dotsContainer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    setTimeout(() => {
      this.updateContentIndicators(targetScroll, maxScroll);
    }, 300);
  }

  private updateContentIndicators(currentScroll: number, maxScroll: number): void {
    if (!this.navigationDotsWrapper?.nativeElement) return;

    const wrapper = this.navigationDotsWrapper.nativeElement;

    const hasContentLeft = currentScroll > 10;

    const hasContentRight = currentScroll < (maxScroll - 10);

    wrapper.classList.toggle('has-content-left', hasContentLeft);
    wrapper.classList.toggle('has-content-right', hasContentRight);
  }


  onDotsScroll(): void {
  }
}
