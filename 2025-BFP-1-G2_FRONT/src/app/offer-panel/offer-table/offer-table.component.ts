import { Component } from '@angular/core';
import { OfferService } from "../../services/offer.service";
import { AuthService } from "../../auth/services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from '@angular/router';
import { DetailedCardData, DetailedCardAction, Candidate } from "../../detailed-card/detailed-card.component";

@Component({
  selector: 'app-offer-table',
  templateUrl: './offer-table.component.html',
  styleUrls: ['./offer-table.component.css']
})
export class OfferTableComponent {
  offers: any[] = [];
  filteredOffers: any[] = [];
  searchTerm: string = '';
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;
  isCompany = false;
  isCandidate = false;

  constructor(
    private offerService: OfferService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.loadUserRole();
    this.loadOffers();
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
          candidates: offer.candidates || []
        }));
        this.filteredOffers = [...this.offers];
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });
  }

  openDetailedCard(offerIndex: number) {
    this.detailedCardData = this.filterOffers().map(offer => ({
      id: offer.id,
      title: offer.title,
      subtitle: `${offer.companyName}  ${offer.email}`,
      content: `
        <p><strong>Descripción:</strong></p>
        <p>${offer.description}</p>`,
      metadata: this.getMetadataForOffer(offer),
      actions: this.getActionsForOffer(offer),
      candidates: offer.candidates,
      editable: false,
    }));

    this.currentDetailIndex = offerIndex;
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
    return this.offers.filter((offer: any) =>
      offer.title.toLowerCase().includes(searchTerm) ||
      offer.description.toLowerCase().includes(searchTerm)
    );
  }
}
