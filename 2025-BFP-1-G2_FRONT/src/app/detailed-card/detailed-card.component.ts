import { Component, Input, Output, EventEmitter, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from "@angular/material/core";
import { MatDatepicker } from "@angular/material/datepicker";
import { Tag } from '../models/tag.model';
import { Candidate } from '../models/candidate.model';
import { PageResponse } from '../models/page-response.model';
import { AuthService } from '../auth/services/auth.service';
import { CandidateService } from '../services/candidate.service';
import { ChatService } from '../services/chat.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { OfferService } from '../services/offer.service';
import { DetailedCardAction, DetailedCardData } from '../models/detailed-card-data.model';
import { NavigationStateService } from '../services/navigation-state.service';

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
export class DetailedCardComponent implements OnInit {
  formatContent(description: string) {
    return description.replace(/\n/g, '<br>');
  }
    onImageError(event: any) {
    event.target.style.display = 'none';
  }

  @Input() isVisible: boolean = false;
  @Input() data: DetailedCardData[] = [];
  @Input() currentIndex: number = 0;
  @Input() showNavigation: boolean = true;
  @Input() editMode: boolean = false;
  @Input() availableTags: Tag[] = [];

  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<{ action: string, data: any }>();
  @Output() onNavigate = new EventEmitter<number>();
  @Output() onSave = new EventEmitter<DetailedCardData>();
  @Output() onChipClick = new EventEmitter<{ tag: Tag }>();

  @ViewChild('foundedDatePicker') foundedDatePicker!: MatDatepicker<Date>;
  startYear = new Date();

  currentItem: DetailedCardData | null = null;
  editedItem: DetailedCardData | null = null;
  panelOpenState: boolean = false;
  isEditing: boolean = false;
  addingNewItem: boolean = false;
  maxDate: Date = new Date();
  minDate: Date = new Date(1800, 0, 1);
  selectedTabIndex: number = 0;
  isCompany: boolean = false;
  recommendedCandidates: Candidate[] = [];
  candidates: Candidate[] = [];

  // Pagination properties for recommended candidates
  currentRecommendedPage: number = 0;
  totalRecommendedPages: number = 0;
  totalRecommendedElements: number = 0;
  isLoadingRecommended: boolean = false;

  // Pagination properties for regular candidates
  currentCandidatesPage: number = 0;
  totalCandidatesPages: number = 0;
  totalCandidatesElements: number = 0;
  candidatesPageSize: number = 4;
  isLoadingCandidates: boolean = false;

  constructor(private authService: AuthService,
    private candidateService: CandidateService,
    private chatService: ChatService,
    private snackBar: MatSnackBar,
    private router: Router,
    private offerService: OfferService,
    private navigationStateService: NavigationStateService
  ) { }

  ngOnInit() {
    this.updateCurrentItem();
    this.checkUserType();
  }

  ngOnChanges() {
    this.updateCurrentItem();
  }

  onTagClick(tag: Tag) {
    this.onAction.emit({
      action: 'tagClick',
      data: { tag: tag }
    });
  }

  openChatWithCandidate(candidate: Candidate): void {
    if (candidate.login) {
      this.candidateService.getSpecificCandidateDetails(candidate.login).
        subscribe({
          next: (candidate) => {
            this.chatService.startConversation(candidate.id);
          },
          error: (error) => {
            this.snackBar.open('Error: No se pudo obtener el ID del candidato', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
    }
  }

  navigateToCandidate(username: string) {
    this.saveCurrentState();
    this.router.navigate(['/user/profile/', username]);
  }
  private saveCurrentState() {
    const state = {
      component: 'detailed-card',
      data: {
        currentItem: this.currentItem,
        currentIndex: this.currentIndex,
        selectedTabIndex: this.selectedTabIndex,
        data: this.data,
        isVisible: this.isVisible,
        editMode: this.editMode,
        availableTags: this.availableTags,
        showNavigation: this.showNavigation,
        // Pagination states
        currentCandidatesPage: this.currentCandidatesPage,
        currentRecommendedPage: this.currentRecommendedPage,
        totalCandidatesPages: this.totalCandidatesPages,
        totalRecommendedPages: this.totalRecommendedPages,
        totalCandidatesElements: this.totalCandidatesElements,
        totalRecommendedElements: this.totalRecommendedElements,
        candidates: this.candidates,
        recommendedCandidates: this.recommendedCandidates,
        // Edit states
        isEditing: this.isEditing,
        addingNewItem: this.addingNewItem,
        editedItem: this.editedItem
      },
      route: this.router.url,
      params: {},
      queryParams: {}
    };

    this.navigationStateService.saveState(state);
  }

  restoreState(savedData: any) {
    this.navigationStateService.clearState();
    this.currentItem = savedData.currentItem;
    this.currentIndex = savedData.currentIndex;
    this.selectedTabIndex = savedData.selectedTabIndex;
    this.data = savedData.data;
    this.isVisible = savedData.isVisible;
    this.editMode = savedData.editMode;
    this.availableTags = savedData.availableTags;
    this.showNavigation = savedData.showNavigation;

    // Restore pagination states
    this.currentCandidatesPage = savedData.currentCandidatesPage;
    this.currentRecommendedPage = savedData.currentRecommendedPage;
    this.totalCandidatesPages = savedData.totalCandidatesPages;
    this.totalRecommendedPages = savedData.totalRecommendedPages;
    this.totalCandidatesElements = savedData.totalCandidatesElements;
    this.totalRecommendedElements = savedData.totalRecommendedElements;
    this.candidates = savedData.candidates;
    this.recommendedCandidates = savedData.recommendedCandidates;

    // Restore edit states
    this.isEditing = savedData.isEditing;
    this.addingNewItem = savedData.addingNewItem;
    this.editedItem = savedData.editedItem;
  }


  onChipClickHandler(tag: Tag) {
    this.onChipClick.emit({ tag: tag });
    console.log('Chip clicked from detailed card:', tag);
  }

  updateCurrentItem() {
    if (this.data.length > 0) {
      if (this.currentIndex < 0) {
        this.currentIndex = 0;
      } else if (this.currentIndex >= this.data.length) {
        this.currentIndex = this.data.length - 1;
      }

      this.currentItem = this.data[this.currentIndex];
      this.currentCandidatesPage = 0;
      this.currentRecommendedPage = 0;
      if (this.authService.isCompanyCached()) {
        this.loadCandidates(this.currentItem.id, 0);
        this.loadRecommendedCandidates(this.currentItem.id, 0);
      }
      this.editedItem = { ...this.currentItem };

      this.addingNewItem = this.currentItem.id === 0 && !this.currentItem.title;
      this.isEditing = this.addingNewItem;
      this.panelOpenState = false;

    }
  }

  loadCandidates(id: number, page: number = 0) {
    this.isLoadingCandidates = true;
    this.candidateService.getCandidatesByOffer(id, page, this.candidatesPageSize).subscribe({
      next: (response: PageResponse<Candidate>) => {
        this.candidates = response.content;
        this.totalCandidatesPages = response.totalPages;
        this.totalCandidatesElements = response.totalElements;
        this.currentCandidatesPage = response.number;
        this.isLoadingCandidates = false;
      },
      error: (error) => {
        console.error('Error loading candidates:', error);
        this.snackBar.open('Error al cargar candidatos', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingCandidates = false;
      }
    });
  }

  loadRecommendedCandidates(id: number, page: number = 0) {
    this.isLoadingRecommended = true;
    this.candidateService.getRecommendedCandidates(id, page, this.candidatesPageSize).subscribe({
      next: (response: PageResponse<Candidate>) => {
        this.recommendedCandidates = response.content;
        this.totalRecommendedPages = response.totalPages;
        this.totalRecommendedElements = response.totalElements;
        this.currentRecommendedPage = response.number;
        this.isLoadingRecommended = false;
      },
      error: (error) => {
        console.error('Error loading recommended candidates:', error);
        this.snackBar.open('Error al cargar candidatos recomendados', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoadingRecommended = false;
      }
    });
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
      this.onSave.emit({ ...this.editedItem, form: this.editedItem.form });
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
    return `${this.currentIndex + 1}`;
  }

  get hasFewItems(): boolean {
    return this.data.length < 30;
  }

  executeAction(action: DetailedCardAction) {
    this.onAction.emit({
      action: action.action,
      data: { ...action.data, currentItem: this.currentItem }
    });
  }

  aceptCandidate(candidate: Candidate) {
    const lastOption = candidate.valid;
    candidate.valid = true;
    this.offerService.updateCandidateStatus(this.currentItem?.id!, candidate).subscribe({
      next: () => {
        this.snackBar.open('Candidato aceptado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error accepting candidate:', error);
        this.snackBar.open('Error al aceptar candidato', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        candidate.valid = lastOption;
      }
    });
  }

  rejectCandidate(candidate: Candidate) {
    const lastOption = candidate.valid;
    candidate.valid = false;
    this.offerService.updateCandidateStatus(this.currentItem?.id!, candidate).subscribe({
      next: () => {
        this.snackBar.open('Candidato rechazado exitosamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error rejecting candidate:', error);
        this.snackBar.open('Error al rechazar candidato', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        candidate.valid = lastOption;
      }
    });
  }

  deleteOptionCandidate(candidate: Candidate) {
    const lastOption = candidate.valid;
    candidate.valid = null;
    this.offerService.updateCandidateStatus(this.currentItem?.id!, candidate).subscribe({
      next: () => {
        this.snackBar.open('Candidato actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting candidate option:', error);
        this.snackBar.open('Error al actualizar candidato', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        candidate.valid = lastOption;
      }
    });
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

  navigateToIndex(index: number): void {
    if (index >= 0 && index < this.data.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.updateCurrentItem();
      this.onNavigate.emit(this.currentIndex);
    }
  }

  checkUserType(): void {
    this.authService.isCompany().subscribe(isCompany => {
      this.isCompany = isCompany;
    });
  }
  getStatusClass(status: boolean): string {
    switch (status) {
      case true:
        return 'status-approved';
      case false:
        return 'status-rejected';
      case null:
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusText(status: boolean): string {
    switch (status) {
      case true:
        return 'Aprobado';
      case false:
        return 'Rechazado';
      case null:
        return 'Pendiente';
      default:
        return '';
    }
  }

  getTogglePosition(valid: boolean | null): number {
    if (valid === true) return 0;
    if (valid === null) return 1;
    if (valid === false) return 2;
    return 0;
  }

  onToggleChange(candidate: any, newValue: boolean | null): void {
    if (newValue === null) {
      this.deleteOptionCandidate(candidate);
    } else if (newValue === true) {
      this.aceptCandidate(candidate);
    } else if (newValue === false) {
      this.rejectCandidate(candidate);
    }
  }

  // Pagination methods for regular candidates
  moveCandidatesPage(direction: number): void {
    const newPage = this.currentCandidatesPage + direction;
    if (newPage >= 0 && newPage < this.totalCandidatesPages) {
      this.loadCandidates(this.currentItem?.id!, newPage);
    }
  }

  canNavigateCandidatesPrevious(): boolean {
    return this.currentCandidatesPage > 0;
  }

  canNavigateCandidatesNext(): boolean {
    return this.currentCandidatesPage < this.totalCandidatesPages - 1;
  }

  // Pagination methods for recommended candidates
  moveRecommendedPage(direction: number): void {
    const newPage = this.currentRecommendedPage + direction;
    if (newPage >= 0 && newPage < this.totalRecommendedPages) {
      this.loadRecommendedCandidates(this.currentItem?.id!, newPage);
    }
  }

  canNavigateRecommendedPrevious(): boolean {
    return this.currentRecommendedPage > 0;
  }

  canNavigateRecommendedNext(): boolean {
    return this.currentRecommendedPage < this.totalRecommendedPages - 1;
  }

}
