import { Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { OfferService } from "../../services/offer.service";
import { AuthService } from "../../auth/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DetailedCardData, DetailedCardAction } from "../../detailed-card/detailed-card.component";
import { Tag } from "../../admin/admin-dashboard/admin-dashboard.component";
import { TagService } from 'src/app/services/tag.service';
import { Offer } from '../offer-panel.module';

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent implements OnDestroy {


  offers: Offer[] = [];
  filteredOffers: any[] = [];
  searchTerm: string = '';
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;
  isCompany = false;
  isCandidate = false;
  availableTags: Tag[] = [];
  selectedTags: Tag[] = [];
  selectedCandidatures: any[] = [];
  tagsFilterControl = new FormControl<Tag[]>([]);


  currentOfferView: 'all' | 'recommended' | 'applied' | 'bookmarks' = 'all';
  bookmarkedOffers: number[] = []; // Array de IDs de ofertas guardadas
  serverBookmarkedOffers: any[] = []; // Ofertas bookmarked del servidor

  isLoading = true;

  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder,
    private tagService: TagService
  ) {
    this.loadOffers();
    this.loadMyTags();
    this.loadUserRole();
    this.loadAllTags();
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
    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        this.isCompany = hasRole;
      }
    });
    this.authService.hasRole('ROLE_CANDIDATE').subscribe({
      next: (hasRole) => {
        this.isCandidate = hasRole;
        if (hasRole) {
          this.loadBookmarksFromServer();
        }
      }
    });
  }

  loadOffers() {
    this.offerService.getOffers().subscribe({
      next: (offers: any[]) => {
        this.offers = offers.map((offer: any) => ({
          id: offer.id,
          title: offer.title,
          description: offer.description,
          companyName: offer.companyName,
          email: offer.email,
          dateAdded: new Date(offer.dateAdded).toLocaleDateString(),
          candidatesCount: offer.candidatesCount || 0,
          candidates: offer.candidates || [],
          tags: offer.tags || [],
          metadata: {
            email: offer.email,
            companyName: offer.companyName,
            dateAdded: offer.dateAdded ? new Date(offer.dateAdded).toLocaleDateString() : '',
          },
          logo: offer.logo || '',
        }));
        this.isLoading = false;
        this.offerService.getCandidateOffers().subscribe({
          next: (offers: any[]) => {
            this.selectedCandidatures = offers.map((offer: any) => ({
              id: offer.id,
              title: offer.title,
              description: offer.description,
              companyName: offer.companyName,
              email: offer.email,
              dateAdded: new Date(offer.dateAdded).toLocaleDateString(),
              candidatesCount: offer.candidatesCount || 0,
              candidates: offer.candidates || [],
              tags: offer.tags || [],
              isValid: offer.candidateValid === true ? 'VALID' : offer.candidateValid === false ? 'INVALID' : 'PENDING',
              logo: offer.logo || ''
            }));
            this.offers = this.offers.map(offer => {
              const matched = this.selectedCandidatures.find(sel => sel.id === offer.id);
              if (matched) {
                return { ...offer, isValid: matched.isValid };
              }
              return offer;
            });
          },
          error: (error: any) => {
            console.error('Error fetching candidate offers', error);
          }
        });
        console.log('Offers loaded successfully:', this.offers);
        this.filteredOffers = [...this.offers];
        
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });


  }

  openDetailedCardFromApplied(offerIndex: number) {
    this.detailedCardData = this.selectedCandidatures.map(offer => ({
      id: offer.id,
      title: offer.title,
      editableTitle: offer.title,
      titleLabel: 'Título de la oferta',
      subtitle: `${offer.companyName}  ${offer.email}`,
      content: offer.description,
      contentLabel: 'Descripción de la oferta',
      metadata: this.getMetadataForOffer(offer),
      actions: this.getActionsForOffer(offer),
      candidates: offer.candidates,
      editable: false,
      form: undefined,
      tags: offer.tags || [],
    }));

    this.currentDetailIndex = offerIndex;
    this.showDetailedCard = true;
    this.disableBodyScroll();
  }

  openDetailedCardFromSuggested(offerIndex: number) {
    const recommendedOffers = this.recomendedOffers();

    this.detailedCardData = recommendedOffers.map(offer => ({
      id: offer.id,
      title: offer.title,
      editableTitle: offer.title,
      titleLabel: 'Título de la oferta',
      subtitle: `${offer.companyName}  ${offer.email}`,
      content: offer.description,
      contentLabel: 'Descripción de la oferta',
      metadata: this.getMetadataForOffer(offer),
      actions: this.getActionsForOffer(offer),
      candidates: offer.candidates,
      editable: this.isCompany,
      form: this.isCompany ? this.createOfferForm(offer) : undefined,
      tags: offer.tags || [],
    }));

    this.currentDetailIndex = offerIndex;
    this.showDetailedCard = true;
    this.disableBodyScroll();
  }

  openDetailedCard(offerIndex: number) {
    this.detailedCardData = this.filterOffers().map(offer => ({
      id: offer.id,
      title: offer.title,
      editableTitle: offer.title,
      titleLabel: 'Título de la oferta',
      subtitle: `${offer.companyName}  ${offer.email}`,
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
    if (this.isCompany)
      return {
        'Fecha de publicación': offer.dateAdded,
      };
    else return {
      'Fecha de publicación': offer.dateAdded,
      'Empresa': offer.companyName,
      'Email': offer.email,
    };
  }

  private getActionsForOffer(offer: any): DetailedCardAction[] {
    const actions: DetailedCardAction[] = [];
    if (this.isCompany) {

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
      // Acción de bookmark para candidatos
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

      case 'viewCandidates':
        this.router.navigate(['/company/candidates'], {
          queryParams: { offerId: data.offerId, offerTitle: data.offerTitle }
        });
        break;

      case 'toggleBookmark':
        this.toggleBookmark(data.offer.id);
        // Refrescar la detailed card para actualizar el botón
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
          this.loadOffers();
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

  filterOffers(): any[] {
    // Get the base offers based on current view
    let filtered = [...this.getCurrentViewOffers()];
    
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchLower) ||
        offer.description.toLowerCase().includes(searchLower) ||
        offer.companyName.toLowerCase().includes(searchLower) ||
        offer.email.toLowerCase().includes(searchLower)
      );
    }

    if (this.tagsFilterControl.value) {
      const selectedTags = this.tagsFilterControl.value || [];
      if (selectedTags.length > 0) {
        const selectedTagIds = selectedTags.map(tag => tag.id);
        filtered = filtered.filter((offer: any) =>
          offer.tags.some((tag: Tag) => selectedTagIds.includes(tag.id))
        );
      }
    }
    return filtered;
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
    let filtered = this.selectedCandidatures.filter((offer: any) =>
      offer.id
    );
    return filtered;
  }

  // New methods for offer view selection
  setOfferView(view: 'all' | 'recommended' | 'applied' | 'bookmarks') {
    this.currentOfferView = view;
  }

  getRecommendedOffersCount(): number {
    return this.recomendedOffers().length;
  }

  getAppliedOffersCount(): number {
    return this.selectedCandidaturesOffers().length;
  }

  getBookmarkedOffersCount(): number {
    return this.getBookmarkedOffers().length;
  }

  getBookmarkedOffers(): any[] {
    return this.serverBookmarkedOffers;
  }

  toggleBookmark(offerId: number) {
    const isCurrentlyBookmarked = this.isBookmarked(offerId);
    
    if (isCurrentlyBookmarked) {
      // Remover bookmark
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
    switch (this.currentOfferView) {
      case 'recommended':
        return this.recomendedOffers();
      case 'applied':
        return this.selectedCandidaturesOffers();
      case 'bookmarks':
        return this.getBookmarkedOffers();
      default:
        return this.offers;
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
            this.loadOffers();
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
          tags: tags || []
        };

        this.offerService.updateOffer(offerData).subscribe({
          next: () => {
            this.snackBar.open('Oferta actualizada con exito', 'Cerrar', {
              duration: 3000,
            });
            this.loadOffers();
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
    const filteredOffers = this.filterOffers();
    const offerIndex = filteredOffers.findIndex(o => o.id === offer.id);
    
    if (offerIndex !== -1) {
      this.openDetailedCard(offerIndex);
    }
  }

  private refreshDetailedCard() {
    if (this.showDetailedCard && this.detailedCardData.length > 0) {
      // Actualizar las acciones del item currente
      const currentOffer = this.getCurrentViewOffers()[this.currentDetailIndex];
      if (currentOffer) {
        this.detailedCardData[this.currentDetailIndex].actions = this.getActionsForOffer(currentOffer);
      }
    }
  }
}
