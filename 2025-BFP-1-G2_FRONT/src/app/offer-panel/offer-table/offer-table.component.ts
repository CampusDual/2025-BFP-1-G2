import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { OfferService } from "../../services/offer.service";
import { AuthService } from "../../auth/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetailedCardData, DetailedCardAction } from "../../detailed-card/detailed-card.component";
import { Tag } from "../../admin/admin-dashboard/admin-dashboard.component";
import { TagService } from 'src/app/services/tag.service';

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent implements AfterViewInit {

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('sliderInput') sliderInput!: ElementRef;
  offers: any[] = [];
  filteredOffers: any[] = [];
  searchTerm: string = '';
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;
  isCompany = false;
  isCandidate = false;
  availableTags: Tag[] = [];
  selectedTags: Tag[] = [];
  isLoading: boolean = true;

  sliderValue = 0;
  maxSliderValue = 100;
  isScrolling = false;

  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private formBuilder: FormBuilder,
    private tagService: TagService
  ) {
    this.loadMyTags();
    this.loadUserRole();
    this.loadOffers();
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateMaxSliderValue();
    }, 500);
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
            dateAdded: offer.dateAdded
          },
        }));
        console.log('Offers loaded successfully:', this.offers);
        this.filteredOffers = [...this.offers];
        setTimeout(() => {
          this.updateMaxSliderValue();
        }, 200);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });
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
    }));
    this.currentDetailIndex = offerIndex;
    this.showDetailedCard = true;
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
      actions.push({
        label: 'Aplicar a oferta',
        action: 'apply',
        color: 'primary',
        icon: 'send',
        data: { offer: offer }
      });

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
  }

  filterOffers(): any[] {
    const searchTerm = this.searchTerm.toLowerCase();
    const filtered = this.offers.filter((offer: any) =>
      offer.title.toLowerCase().includes(searchTerm) ||
      offer.description.toLowerCase().includes(searchTerm)
    );

    setTimeout(() => {
      this.updateMaxSliderValue();
    }, 100);

    return filtered;
  }

  recomendedOffers(): any[] {
    const selectedTagIds = this.selectedTags.map(tag => tag.id);
    let filtered = this.offers.filter((offer: any) =>
      offer.tags.some((tag: Tag) => selectedTagIds.includes(tag.id) )
    );

    filtered = filtered.sort((a: any, b: any) => {
      const aMatchCount = a.tags.filter((tag: Tag) => selectedTagIds.includes(tag.id)).length;
      const bMatchCount = b.tags.filter((tag: Tag) => selectedTagIds.includes(tag.id)).length;
      return bMatchCount - aMatchCount;
    });
    return filtered;
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

  scrollLeft() {
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = 1000;
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
    this.updateSliderFromScroll();
  }

  scrollRight() {
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = 1000;
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    this.updateSliderFromScroll();
  }

  onSliderChange(event: any): void {

    const sliderValue = event.value || event.target?.value || 0;
    const container = this.scrollContainer.nativeElement;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const targetScrollLeft = (sliderValue / 100) * maxScrollLeft;

    container.scrollTo({
      left: targetScrollLeft
    });
  }

  updateSliderFromScroll(): void {
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (maxScrollLeft > 0) {
        this.sliderValue = (container.scrollLeft / maxScrollLeft) * 100;
        if (this.sliderInput?.nativeElement) {
          this.sliderInput.nativeElement.value = this.sliderValue;
        }
      } else {
        this.sliderValue = 0;
      }
    }, 100);
  }

  onScrollContainerScroll(): void {
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.updateSliderFromScroll();
      setTimeout(() => {
        this.isScrolling = false;
      }, 150);
    }
  }

  updateMaxSliderValue(): void {
    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      this.maxSliderValue = maxScrollLeft > 0 ? 100 : 0;
      this.updateSliderFromScroll();
    }, 100);
  }
}
