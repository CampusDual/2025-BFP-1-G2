import { Component, OnDestroy } from '@angular/core';
import { OfferService } from "../../services/offer.service";
import { AuthService } from "../../auth/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DetailedCardData, DetailedCardAction } from "../../detailed-card/detailed-card.component";
import { Tag } from 'src/app/models/tag.model';
import { TagService } from 'src/app/services/tag.service';
import { Offer } from 'src/app/models/offer.model';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent implements OnDestroy {

  offers: Offer[] = [];
  searchTerm: string = '';
  lastSearchTerm: string = '';
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;
  isCompany = false;
  isCandidate = false;
  availableTags: Tag[] = [];
  selectedTags: Tag[] = [];
  selectedTagIds: number[] = [];
  selectedCandidatures: any[] = [];
  tagsFilterControl = new FormControl<Tag[]>([]);
  tagSearchControl = new FormControl('');
  filteredTags: Observable<Tag[]>;
  bookmarkedOfferCount: number = 0;
  recomendedOfferCount: number = 0;
  appliedOfferCount: number = 0;
  activeOfferCount: number = 0;
  draftOfferCount: number = 0;
  archivedOfferCount: number = 0;
  firstFetch = true;
  currentOfferView: 'all' | 'recommended' | 'applied' | 'bookmarks' = 'all';
  bookmarkedOffers: number[] = [];
  currentOfferStatus: 'draft' | 'archived' | 'active' = 'active';
  averageHiringTime: number | null = null;

  isLoading = true;
  totalPages: number = 0;
  totalElements: number = 0;
  currentPage: number = 0;
  pageSize: number = 8;
  hasNoOffers: boolean = false;
  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder,
    private tagService: TagService
  ) {
    this.loadAllTags();
    this.loadUserRole();
    this.filteredTags = combineLatest([
      this.tagSearchControl.valueChanges.pipe(startWith('')),
      this.tagsFilterControl.valueChanges.pipe(startWith([]))
    ]).pipe(
      map(([searchValue]) => {
        const currentTags = this.tagsFilterControl.value || [];
        this.selectedTagIds = currentTags.map(tag => tag.id).filter((id): id is number => id !== undefined);
        return this._filterTags(searchValue || '');
      })
    );
  }

  loadAllTags() {
    this.tagService.getAllTags().subscribe({
      next: (tags: Tag[]) => {
        this.availableTags = tags;
      },
      error: (error: any) => {
        console.error('Error fetching available tags', error);
      }
    });
  }

    ngOnInit() {
      this.offerService.getAverageHiringTime().subscribe(avg => {
        this.averageHiringTime = avg;
      });
    }


  loadUserRole() {
    if (this.authService.getRolesCached().includes('ROLE_COMPANY')) {
      this.isCompany = true;
      this.loadCompanyOffers();
    } else if (this.authService.getRolesCached().includes('ROLE_CANDIDATE')) {
      this.isCandidate = true;
      this.loadCandidateOffers(0);
    }
    else {
      this.isCompany = false;
      this.isCandidate = false;
      this.loadOffers(0);
    }
  }

  onSearchChange() {
    setTimeout(() => {
      if (this.searchTerm !== this.lastSearchTerm) {
        this.lastSearchTerm = this.searchTerm;
        this.movePage(0);
      }
    }, 1000);
  }

  loadCompanyOffers(operation: number = 0) {
    const newPage = this.currentPage + operation;
    if (this.firstFetch || newPage >= 0 && newPage < this.totalPages) {
      this.firstFetch = false;
      this.currentPage = newPage;
      this.isLoading = true;
      this.offerService.getCompanyOffers(this.currentOfferStatus, this.searchTerm, this.selectedTagIds, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.offers = response.content.map((offer: Offer) => ({
            ...offer,
            dateToString: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : new Date().toLocaleDateString(),
          }));
          this.setArchivedOffersCount();
          this.setDraftOffersCount();
          this.serActiveOffersCount();
          this.isLoading = false;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.hasNoOffers = response.content.length === 0;
        },
        error: (error: any) => {
          console.error('Error fetching offers', error);
        }
      });
    }
  }

  loadCandidateOffers(operation: number) {
    const newPage = this.currentPage + operation;
    if (this.firstFetch || newPage >= 0 && newPage < this.totalPages) {
      this.firstFetch = false;
      this.currentPage = newPage;
      this.isLoading = true;
      this.offerService.getCandidateOffers(this.searchTerm, this.selectedTagIds, this.currentOfferView, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.offers = response.content.map((offer: Offer) => ({
            ...offer,
            dateToString: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : new Date().toLocaleDateString(),
            isValid: (offer.applied && offer.candidateValid === true) ? 'VALID' :
              (offer.applied && offer.candidateValid === false) ? 'INVALID' : (offer.applied) ? 'PENDING' : undefined
          }));
          this.setBookmarkedOffersCount();
          this.setRecommendedOffersCount();
          this.setAppliedOffersCount();
          this.setAllOffersCount();
          console.log('Candidate offers loaded successfully:', this.offers);
          this.isLoading = false;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.hasNoOffers = response.content.length === 0;
        },
        error: (error: any) => {
          console.error('Error fetching candidate offers', error);
          this.isLoading = false;
        }
      });
    }
  }

  loadOffers(operation: number) {
    const newPage = this.currentPage + operation;
    if (this.firstFetch || newPage >= 0 && newPage < this.totalPages) {
      this.firstFetch = false;
      this.currentPage = newPage;
      this.isLoading = true;
      this.offerService.getOffers(this.searchTerm, this.selectedTagIds, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.offers = response.content.map((offer: Offer) => ({
            ...offer,
            dateToString: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : new Date().toLocaleDateString(),
          }));
          this.isLoading = false;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.hasNoOffers = response.content.length === 0;
        },
        error: (error: any) => {
          console.error('Error fetching offers', error);
        }
      });
    }
  }


  movePage(operation: number) {
    this.currentPage = 0;
    this.firstFetch = true;
    this.currentDetailIndex = 0;
    if (this.isCompany) {
      this.loadCompanyOffers(operation);
    } else if (this.isCandidate) {
      this.loadCandidateOffers(operation);
    } else {
      this.loadOffers(operation);
    }
  }

  openDetailedCard(offerIndex: number) {
    this.detailedCardData = this.offers.map((offer: Offer) => ({
      id: offer.id!,
      title: offer.title,
      editableTitle: offer.title,
      titleLabel: 'Título de la oferta',
      subtitle: !this.isCompany ? `${offer.companyName}  ${offer.email}` : '',
      content: offer.description,
      contentLabel: 'Descripción de la oferta',
      metadata: this.getMetadataForOffer(offer),
      actions: this.getActionsForOffer(offer),
      candidates: offer.candidates,
      editable: this.isCompany,
      form: this.isCompany ? this.createOfferForm(offer) : undefined,
      tags: offer.tags || [],
      availableTags: this.isCompany ? this.availableTags : [],
    }));
    this.currentDetailIndex = offerIndex;
    this.showDetailedCard = true;
    this.disableBodyScroll();
  }

  openNewOfferCard() {
    const blankOffer = {
      id: 0,
      title: '',
      description: '',
      companyName: '',
      email: '',
      dateAdded: new Date().toLocaleDateString(),
      candidatesCount: 0,
      candidates: [],
      tags: []
    };

    this.detailedCardData = [{
      id: 0,
      title: '',
      editableTitle: '',
      titleLabel: 'Título de la oferta',
      subtitle: 'Nueva oferta',
      content: '',
      contentLabel: 'Descripción de la oferta',
      metadata: this.getMetadataForOffer(blankOffer),
      actions: [],
      candidates: [],
      editable: true,
      form: this.createOfferForm(blankOffer),
      tags: [],
    }];

    this.currentDetailIndex = 0;
    this.showDetailedCard = true;
    this.disableBodyScroll();
  }

  private getMetadataForOffer(offer: any): { [key: string]: any } {
    if (this.isCompany) {
      const metadata: { [key: string]: any } = {
        'Fecha de publicación': offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString('es-ES') : '',
      };
      if (offer.status) {
        const statusLabels: { [key: string]: string } = {
          'PUBLISHED': 'Publicada',
          'DRAFT': 'Borrador',
          'ARCHIVED': 'Archivada',
          'ACTIVE': 'Activa'
        };
        metadata['Estado'] = statusLabels[offer.status] || offer.status;
      }

      return metadata;
    } else {
      return {
        'Fecha de publicación': offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString('es-ES') : '',
        'Empresa': offer.companyName,
        'Email': offer.email,
      };
    }
  }

  private getActionsForOffer(offer: any): DetailedCardAction[] {
    const actions: DetailedCardAction[] = [];
    if (this.isCompany) {

      if (offer.status !== 'ACTIVE' && offer.status !== 'PUBLISHED') {
        actions.push({
          label: 'Publicar oferta',
          action: 'publishOffer',
          color: 'accent',
          icon: 'publish',
          data: { offer: offer }
        });
      }

      if (offer.status !== 'DRAFT') {
        actions.push({
          label: 'Guardar como borrador',
          action: 'draftOffer',
          color: 'accent',
          icon: 'save',
          data: { offer: offer }
        });
      }

      if (offer.status !== 'ARCHIVED') {
        actions.push({
          label: 'Archivar oferta',
          action: 'archiveOffer',
          color: 'accent',
          icon: 'archive',
          data: { offer: offer }
        });
      }

      actions.push({
        label: 'Eliminar oferta',
        action: 'deleteOffer',
        color: 'warn',
        icon: 'delete',
        data: { offer: offer }
      });

      if (offer.candidates && offer.candidates.length > 0) {
        actions.push({
          label: 'Ver candidatos' + ` (${offer.candidates.length})`,
          action: 'viewCandidates',
          color: 'primary',
          icon: 'people',
          data: { offerId: offer.id, offerTitle: offer.title }
        });
      }

    } else if (this.isCandidate) {

      actions.push({
        label: offer.bookmarked ? 'Quitar' : 'Guardar',
        action: 'toggleBookmark',
        color: offer.bookmarked ? 'warn' : 'primary',
        icon: offer.bookmarked ? 'bookmark' : 'bookmark_border',
        data: { offer: offer }
      });

      if (offer.isValid === 'VALID') {
        actions.push({
          label: 'Validada',
          action: 'none',
          color: 'primary',
          icon: 'check',
          data: { offer: offer }
        });
      }
      else if (offer.isValid === 'INVALID') {
        actions.push({
          label: 'Rechazada',
          action: 'none',
          color: 'warn',
          icon: 'close',
          data: { offer: offer }
        });
      } else if (offer.isValid === 'PENDING') {
        actions.push({
          label: 'Pendiente de validación',
          action: 'none',
          color: 'accent',
          icon: 'hourglass_empty',
          data: { offer: offer }
        });
      }
      else {
        actions.push({
          label: 'Aplicar a oferta',
          action: 'apply',
          color: 'primary',
          icon: 'send',
          data: { offer: offer }
        });
      }

    } else {
      actions.push({
        label: 'Iniciar sesión para aplicar',
        action: 'loginToApply',
        color: 'primary',
        icon: 'login',
        data: { offer: offer }
      });
    }

    return actions;
  }

  onDetailedCardAction(event: { action: string, data: any }) {
    const { action, data } = event;

    switch (action) {

      case 'apply':
        this.applyToOffer(data.offer);
        break;

      case 'deleteOffer':
        this.deleteOffer(data.offer);
        break;

      case 'publishOffer':
        this.updateOfferStatus(data.offer.id, 'active');
        break;

      case 'archiveOffer':
        this.updateOfferStatus(data.offer.id, 'archived');
        break;

      case 'draftOffer':
        this.updateOfferStatus(data.offer.id, 'draft');
        break;

      case 'viewCandidates':
        this.router.navigate(['/company/candidates'], {
          queryParams: { offerId: data.offerId, offerTitle: data.offerTitle }
        });
        break;

      case 'toggleBookmark':
        this.toggleBookmark(data.offer.id);
        this.refreshDetailedCard();
        break;

      case 'loginToApply':
        this.redirectToLogin(data.offer);
        break;

      default:
        console.log('Acción no reconocida:', action);
    }
  }


  private applyToOffer(offer: any) {
    if (this.authService.isLoggedIn()) {
      this.offerService.applyToOffer(offer.id).subscribe({
        next: () => {
          this.snackBar.open('Aplicación enviada exitosamente', 'Cerrar', { duration: 3000 });
          this.closeDetailedCard();
        },
        error: (error) => {
          console.error('Error applying to offer:', error);
          this.snackBar.open(error.error || 'Error al aplicar a la oferta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.redirectToLogin(offer);
    }
  }


  private deleteOffer(offer: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar la oferta "${offer.title}"?`)) {
      this.offerService.deleteOffer(offer.id).subscribe({
        next: () => {
          this.snackBar.open('Oferta eliminada exitosamente', 'Cerrar', { duration: 3000 });
          this.loadCompanyOffers();
          this.closeDetailedCard();
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
          this.snackBar.open('Error al eliminar la oferta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  private redirectToLogin(offer: any) {
    localStorage.setItem('pendingOfferId', offer.id);
    this.router.navigate(['/login']);
  }

  closeDetailedCard() {
    this.showDetailedCard = false;
    this.enableBodyScroll();
  }


  private _filterTags(value: string): Tag[] {
    const filterValue = value.toLowerCase();
    const currentTags = this.tagsFilterControl.value || [];

    this.selectedTagIds = currentTags.map(tag => tag.id).filter((id): id is number => id !== undefined);

    return this.availableTags.filter(tag =>
      tag.name.toLowerCase().includes(filterValue) &&
      !this.selectedTagIds.includes(tag.id!)
    );
  }

  onTagSelected(event: any) {
    const selectedTag = event.option.value;
    const currentTags = this.tagsFilterControl.value || [];

    if (!currentTags.find(tag => tag.id === selectedTag.id)) {
      const updatedTags = [...currentTags, selectedTag];
      this.tagsFilterControl.setValue(updatedTags);

      this.selectedTagIds = updatedTags.map(tag => tag.id).filter((id): id is number => id !== undefined);
    }

    this.filteredTags = combineLatest([
      this.tagSearchControl.valueChanges.pipe(startWith('')),
      this.tagsFilterControl.valueChanges.pipe(startWith([]))
    ]).pipe(
      map(([searchValue]) => this._filterTags(searchValue || ''))
    );

    this.tagSearchControl.setValue('');
    this.movePage(0);
  }

  onChipClickHandler(event: { tag: Tag }) {
    this.clearFilters();
    this.closeDetailedCard();
    this.onTagSelected({ option: { value: event.tag } });
  }

  onSearchFocus() {
    if (!this.tagSearchControl.value) {
      this.tagSearchControl.setValue('');
    }
  }

  removeTagFilter(tagToRemove: Tag) {
    const currentTags = this.tagsFilterControl.value || [];
    const updatedTags = currentTags.filter(tag => tag.id !== tagToRemove.id);
    this.tagsFilterControl.setValue(updatedTags);
    this.selectedTagIds = updatedTags.map(tag => tag.id).filter((id): id is number => id !== undefined);
    this.movePage(0);
  }

  setOfferView(view: 'all' | 'recommended' | 'applied' | 'bookmarks') {
    if (this.isLoading) return;
    if (this.currentOfferView === view) return;
    this.currentPage = 0;
    this.firstFetch = true;
    this.searchTerm = '';
    this.lastSearchTerm = '';
    this.tagsFilterControl.setValue([]);
    this.tagSearchControl.setValue('');
    this.currentOfferView = view;
    this.loadCandidateOffers(0);
  }

  setOfferStatus(status: 'draft' | 'archived' | 'active') {
    if (this.isLoading) return;
    if (this.currentOfferStatus === status) return;
    this.currentPage = 0;
    this.firstFetch = true;
    this.searchTerm = '';
    this.lastSearchTerm = '';
    this.tagsFilterControl.setValue([]);
    this.tagSearchControl.setValue('');
    this.currentOfferStatus = status;
    this.loadCompanyOffers(0);
  }

  setAllOffersCount() {
    this.offerService.getAllOffersCount().subscribe({
      next: (count) => {
        this.activeOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching active offers count:', error);
        this.activeOfferCount = 0;
      }
    });
  }
  serActiveOffersCount() {
    this.offerService.getCompanyOffersCount("active").subscribe({
      next: (count) => {
        this.activeOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching active offers count:', error);
        this.activeOfferCount = 0;
      }
    });
  }
  setDraftOffersCount() {
    this.offerService.getCompanyOffersCount("draft").subscribe({
      next: (count) => {
        this.draftOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching active offers count:', error);
        this.draftOfferCount = 0;
      }
    });
  }
  setArchivedOffersCount() {
    this.offerService.getCompanyOffersCount("archived").subscribe({
      next: (count) => {
        this.archivedOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching archived offers count:', error);
        this.archivedOfferCount = 0;
      }
    });
  }

  setRecommendedOffersCount() {
    this.offerService.getRecommendedOffersCount().subscribe({
      next: (count) => {
        this.recomendedOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching recommended offers count:', error);
        this.recomendedOfferCount = 0;
      }
    });
  }

  setAppliedOffersCount() {
    this.offerService.getAppliedOffersCount().subscribe({
      next: (count) => {
        this.appliedOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching recommended offers count:', error);
        this.appliedOfferCount = 0;
      }
    });
  }

  setBookmarkedOffersCount() {
    this.offerService.getBookmarkedOffersCount().subscribe({
      next: (count) => {
        this.bookmarkedOfferCount = count;
      },
      error: (error) => {
        console.error('Error fetching recommended offers count:', error);
        this.bookmarkedOfferCount = 0;
      }
    });
  }


  toggleBookmark(offerId: number) {
    const isCurrentlyBookmarked = this.offers.some(offer => offer.id === offerId && offer.bookmarked);

    if (isCurrentlyBookmarked) {
      this.offerService.removeBookmark(offerId).subscribe({
        next: (response) => {
          this.snackBar.open('Oferta eliminada de guardados', 'Cerrar', { duration: 2000 });
          this.offers = this.offers.map(offer => {
            if (offer.id === offerId) {
              return { ...offer, bookmarked: false };
            }
            return offer;
          });
          this.refreshDetailedCard();
        },
        error: (error) => {
          console.error('Error removing bookmark:', error);
          this.snackBar.open('Error al eliminar el bookmark', 'Cerrar', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.offerService.addBookmark(offerId).subscribe({
        next: (response) => {
          this.snackBar.open('Oferta guardada correctamente', 'Cerrar', { duration: 2000 });
          this.offers = this.offers.map(offer => {
            if (offer.id === offerId) {
              return { ...offer, bookmarked: true };
            }
            return offer;
          });
          this.refreshDetailedCard();
        },
        error: (error) => {
          console.error('Error adding bookmark:', error);
          this.snackBar.open('Error al guardar el bookmark', 'Cerrar', {
            duration: 2000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onDetailedCardSave(editedOffer: any) {
    if (this.isCompany && editedOffer.form) {
      const formValues = editedOffer.form.value;
      const tags: Tag[] = formValues.tags.map((tag: Tag) => ({
        id: tag.id,
        name: tag.name
      }));
      if (editedOffer.id === 0) {
        const newOfferData = {
          title: formValues.title,
          description: formValues.description,
          tags: tags || []
        };
        this.offerService.createOffer(newOfferData).subscribe({
          next: () => {
            this.snackBar.open('Oferta creada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadCompanyOffers();
            this.closeDetailedCard();
          },
          error: (error) => {
            console.error('Error creating offer:', error);
            this.snackBar.open('Error al crear la oferta', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        const offerData = {
          id: editedOffer.id,
          title: formValues.title,
          description: formValues.description,
          tags: tags || [],
        };

        this.offerService.updateOffer(offerData).subscribe({
          next: () => {
            this.snackBar.open('Oferta actualizada con exito', 'Cerrar', {
              duration: 3000,
            });
            this.loadCompanyOffers();
            this.closeDetailedCard();
          },
          error: (error) => {
            console.error('Error updating offer:', error);
            this.snackBar.open('Error al actualizar la oferta', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    }
  }


  private createOfferForm(offer: any): FormGroup {
    return this.formBuilder.group({
      title: [offer.title, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [offer.description, [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      tags: [offer.tags || []]
    });
  }

  isTagSelected(tag: Tag, form: FormGroup): boolean {
    const selectedTags = form.get('tags')?.value || [];
    return selectedTags.some((t: Tag) => t.id === tag.id);
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
        this.snackBar.open('Máximo 5 tags permitidos', 'Cerrar', { duration: 2000 });
      }
    }
  }

  getSelectedTagsCount(form: FormGroup): number {
    const selectedTags = form.get('tags')?.value || [];
    return selectedTags.length;
  }

  private disableBodyScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
  }

  private enableBodyScroll(): void {
    document.body.style.overflow = '';
    document.body.style.height = '';
  }

  ngOnDestroy(): void {
    this.enableBodyScroll();
  }

  onViewDetails(offer: any) {
    const offerIndex = this.offers.findIndex(o => o.id === offer.id);
    if (offerIndex !== -1) {
      this.openDetailedCard(offerIndex);
    }
  }

  updateOfferStatus(offerId: number, newStatus: 'active' | 'archived' | 'draft') {
    this.offerService.updateOfferStatus(offerId, newStatus)
      .subscribe({
        next: (response: string) => {
          console.log('Respuesta del backend:', response);
          const statusMessages = {
            'active': 'publicada',
            'archived': 'archivada',
            'draft': 'guardada como borrador'
          };

          this.snackBar.open(`Oferta ${statusMessages[newStatus]} exitosamente`, 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCompanyOffers();
          this.closeDetailedCard();
        },
        error: (error: any) => {
          console.error(`Error al cambiar estado de oferta a ${newStatus}:`, error);
          this.snackBar.open(`Error al cambiar el estado de la oferta`, 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private refreshDetailedCard() {
    if (this.showDetailedCard && this.detailedCardData.length > 0) {
      const currentOffer = this.offers[this.currentDetailIndex];
      if (currentOffer) {
        this.detailedCardData[this.currentDetailIndex].actions = this.getActionsForOffer(currentOffer);
      }
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.lastSearchTerm = '';
    this.selectedTagIds = [];
    this.tagsFilterControl.setValue([]);
    this.tagSearchControl.setValue('');
    this.hasNoOffers = false;
    this.movePage(0);
  }




}
