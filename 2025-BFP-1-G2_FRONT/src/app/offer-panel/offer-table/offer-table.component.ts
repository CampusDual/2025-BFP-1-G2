import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CandidateOffer, CompanyOffer, OfferService } from "../../services/offer.service";
import { AuthService } from "../../auth/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DetailedCardData, DetailedCardAction } from "../../detailed-card/detailed-card.component";
import { Tag } from "../../admin/admin-dashboard/admin-dashboard.component";
import { TagService } from 'src/app/services/tag.service';
import { Offer } from "../../services/offer.service";
import { CompanyService } from 'src/app/services/company.service';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent implements OnDestroy {
  offers: Offer[] = [];
  filteredOffers: any[] = [];
  searchTerm: string = '';
  lastSearchTerm: string = '';
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;
  isCompany = false;
  isCandidate = false;
  availableTags: Tag[] = [];
  selectedTags: Tag[] = [];
  selectedCandidatures: any[] = [];
  tagsFilterControl = new FormControl<Tag[]>([]);
  tagSearchControl = new FormControl('');
  filteredTags: Observable<Tag[]>;
  bookmarkedOfferCount: number = 0;
  recomendedOfferCount: number = 0;
  appliedOfferCount: number = 0;
  activeOfferCount: number = 0;

  currentOfferView: 'all' | 'recommended' | 'applied' | 'bookmarks' = 'all';
  bookmarkedOffers: number[] = [];
  serverBookmarkedOffers: any[] = [];
  currentOfferStatus: 'draft' | 'archived' | 'active' = 'active';

  isLoading = true;

  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder,
    private tagService: TagService,
    private companyService: CompanyService
  ) {
    this.loadAllTags();
    this.loadUserRole();
    this.filteredTags = combineLatest([
      this.tagSearchControl.valueChanges.pipe(startWith('')),
      this.tagsFilterControl.valueChanges.pipe(startWith([]))
    ]).pipe(
      map(([searchValue, selectedTags]) => this._filterTags(searchValue || ''))
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

  loadMyTags() {
    this.tagService.getCandidateTags().subscribe({
      next: (tags: Tag[]) => {
        this.selectedTags = tags;
        console.log('Available tags loaded successfully:', this.selectedTags);
      },
      error: (error: any) => {
        console.error('Error fetching available tags', error);
      }
    });
  }


  loadUserRole() {
    if (this.authService.getRolesCached().includes('ROLE_COMPANY')) {
      this.isCompany = true;
      this.loadCompanyOffers();
    } else if (this.authService.getRolesCached().includes('ROLE_CANDIDATE')) {
      this.isCandidate = true;
      this.loadCandidateOffers();
      this.loadMyTags();
      this.loadBookmarksFromServer();
    }
    else {
      this.isCompany = false;
      this.isCandidate = false;
      this.loadOffers();
    }
  }

  loadCompanyOffers() {
    this.companyService.getMyCompany().subscribe({
      next: (company) => {
        if (company) {
          this.companyService.getCompanyOffers(company.id).subscribe({
            next: (offers: CompanyOffer[]) => {
              this.offers = offers.map((offer: CompanyOffer) => ({
                ...offer,
                dateToString: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : new Date().toLocaleDateString(),
              }));
              this.isLoading = false;
              this.filteredOffers = [...this.offers];
            },
            error: (error: any) => {
              console.error('Error fetching company offers', error);
            }
          });
        } else {
          console.warn('No company found for the user');
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        console.error('Error fetching company data', error);
      }
    });
  }

  loadCandidateOffers() {
    this.isLoading = true;
    this.offerService.getCandidateOffers(this.currentOfferView).subscribe({
      next: (offers: CandidateOffer[]) => {
        this.offers = offers.map((offer: CandidateOffer) => ({
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
      },
      error: (error: any) => {
        console.error('Error fetching candidate offers', error);
        this.isLoading = false;
      }
    });
  }

  loadCandidateOffersBySearchTerm() {
    this.isLoading = true;
    this.offerService.searchCandidateOffers(this.searchTerm, this.currentOfferView).subscribe({
      next: (offers) => {
        this.offers = offers.map((offer: CandidateOffer) => ({
          ...offer,
          dateToString: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : new Date().toLocaleDateString(),
          isValid: (offer.applied && offer.candidateValid === true) ? 'VALID' :
            (offer.applied && offer.candidateValid === false) ? 'INVALID' : (offer.applied) ? 'PENDING' : undefined
        }));
        console.log('Candidate offers loaded successfully:', this.offers);
        console.log('bajo el termino de busqueda', this.searchTerm);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al buscar ofertas desde el backend:', error);
        this.isLoading = false;
      }
    });
  }

  loadOffers() {
    this.offerService.getOffers().subscribe({
      next: (offers: Offer[]) => {
        this.offers = offers;
        offers = offers.filter(offer =>
          offer.status === 'PUBLISHED'
        );
        this.isLoading = false;
        console.log('Offers loaded successfully:', this.offers);
        this.filteredOffers = [...this.offers];
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });
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
        label: this.isBookmarked(offer.id) ? 'Quitar' : 'Guardar',
        action: 'toggleBookmark',
        color: this.isBookmarked(offer.id) ? 'warn' : 'primary',
        icon: this.isBookmarked(offer.id) ? 'bookmark' : 'bookmark_border',
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
        this.updateOfferStatus(data.offer.id, 'PUBLISHED');
        break;

      case 'archiveOffer':
        this.updateOfferStatus(data.offer.id, 'ARCHIVED');
        break;

      case 'draftOffer':
        this.updateOfferStatus(data.offer.id, 'DRAFT');
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
    const currentTagIds = currentTags.map(tag => tag.id);

    return this.availableTags.filter(tag =>
      tag.name.toLowerCase().includes(filterValue) &&
      !currentTagIds.includes(tag.id)
    );
  }

  onTagSelected(event: any) {
    const selectedTag = event.option.value;
    const currentTags = this.tagsFilterControl.value || [];

    if (!currentTags.find(tag => tag.id === selectedTag.id)) {
      const updatedTags = [...currentTags, selectedTag];
      this.tagsFilterControl.setValue(updatedTags);
    }
    this.filteredTags = combineLatest([
      this.tagSearchControl.valueChanges.pipe(startWith('')),
      this.tagsFilterControl.valueChanges.pipe(startWith([]))
    ]).pipe(
      map(([searchValue]) => this._filterTags(searchValue || ''))
    );
    this.tagSearchControl.setValue('');
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
  }


  recomendedOffers(): any[] {
    const selectedTagIds = this.selectedTags.map(tag => tag.id);
    let filtered = this.offers.filter((offer: any) =>
      offer.tags.some((tag: Tag) => selectedTagIds.includes(tag.id))
    );

    filtered = filtered.sort((a: any, b: any) => {
      const aMatchCount = a.tags.filter((tag: Tag) => selectedTagIds.includes(tag.id)).length;
      const bMatchCount = b.tags.filter((tag: Tag) => selectedTagIds.includes(tag.id)).length;
      return bMatchCount - aMatchCount;
    });
    return filtered;
  }

  selectedCandidaturesOffers(): any[] {
    let filtered = this.offers.filter((offer: CandidateOffer) =>
      offer.applied === true
    );
    return filtered;
  }

  setOfferView(view: 'all' | 'recommended' | 'applied' | 'bookmarks') {
    this.currentOfferView = view;
    if (this.isCandidate) {
      this.loadCandidateOffers();
    }
  }

  setOfferStatus(status: 'draft' | 'archived' | 'active') {
    this.currentOfferStatus = status;
  }

  getDraftOffersCount(): number {
    return this.offers.filter(offer => offer.status === 'DRAFT').length;
  }

  getArchivedOffersCount(): number {
    return this.offers.filter(offer => offer.status === 'ARCHIVED').length;
  }

  getActiveOffersCount(): number {
    return this.offers.filter(offer => offer.status === 'ACTIVE').length;
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

  getBookmarkedOffers(): any[] {
    return this.serverBookmarkedOffers;
  }

  toggleBookmark(offerId: number) {
    const isCurrentlyBookmarked = this.isBookmarked(offerId);

    if (isCurrentlyBookmarked) {
      this.offerService.removeBookmark(offerId).subscribe({
        next: (response) => {
          this.snackBar.open('Oferta eliminada de guardados', 'Cerrar', { duration: 2000 });
          this.loadBookmarksFromServer();
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
          this.loadBookmarksFromServer();
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

  isBookmarked(offerId: number): boolean {
    return this.serverBookmarkedOffers.some(offer => offer.id === offerId);
  }

  private loadBookmarksFromServer() {
    if (this.isCandidate) {
      this.offerService.getUserBookmarksOffers().subscribe({
        next: (bookmarks) => {
          this.serverBookmarkedOffers = bookmarks;
          this.bookmarkedOffers = bookmarks.map(offer => offer.id || 0).filter(id => id > 0);
          this.serverBookmarkedOffers = bookmarks.map(offer => ({
            ...offer,
            dateAdded: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : ''
          }));

        },
        error: (error) => {
          console.error('Error loading bookmarks:', error);
        }
      });
    }
  }



  getCurrentViewOffers(): any[] {
    if (this.isCandidate) {
      switch (this.currentOfferView) {
        case 'recommended':
          return this.recomendedOffers();
        case 'applied':
          return this.selectedCandidaturesOffers();
        case 'bookmarks':
          return this.getBookmarkedOffers();
        case 'all':
        default:
          return this.offers;
      }
    }

    if (this.isCompany) {
      const statusMap = {
        'draft': 'DRAFT',
        'archived': 'ARCHIVED',
        'active': 'ACTIVE'
      };
      const targetStatus = statusMap[this.currentOfferStatus];
      return this.offers.filter(offer => offer.status === targetStatus);
    }

    return this.offers;
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

  updateOfferStatus(offerId: number, newStatus: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT') {
    let updateObservable;

    switch (newStatus) {
      case 'PUBLISHED':
        updateObservable = this.companyService.publishOffer(offerId);
        break;
      case 'ARCHIVED':
        updateObservable = this.companyService.archiveOffer(offerId);
        break;
      case 'DRAFT':
        updateObservable = this.companyService.draftOffer(offerId);
        break;
      default:
        console.error('Estado de oferta no válido:', newStatus);
        return;
    }

    updateObservable.subscribe({
      next: () => {
        const statusMessages = {
          'PUBLISHED': 'publicada',
          'ARCHIVED': 'archivada',
          'DRAFT': 'guardada como borrador'
        };

        this.snackBar.open(`Oferta ${statusMessages[newStatus]} exitosamente`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadCompanyOffers();
        this.closeDetailedCard();
      },
      error: (error) => {
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
}
