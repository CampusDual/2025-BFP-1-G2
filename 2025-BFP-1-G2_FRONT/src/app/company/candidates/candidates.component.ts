import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../../services/offer.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Candidate } from 'src/app/detailed-card/detailed-card.component';

type SortColumn = 'name' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css']
})
export class CandidatesComponent implements OnInit {
  offerId: number | null = null;
  offerTitle: string | null = null;
  
  candidates: Candidate[] = [];
  sortedCandidates: Candidate[] = [];
  
  // Variables para el ordenamiento
  currentSortColumn: SortColumn | null = null;
  currentSortDirection: SortDirection = 'asc';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const offerId = params['offerId'];
      const offerTitle = params['offerTitle'];
      
      if (offerId) {
        this.offerId = offerId;
        this.offerTitle = offerTitle || 'Oferta sin título';
        this.loadCandidatesForOffer();
      } else {
        this.router.navigate(['/company/offers']);
      }
    });
  }

  loadCandidatesForOffer(): void {
    if (this.offerId !== null) {
      this.offerService.getCandidates(this.offerId).subscribe({
        next: (candidates) => {
          this.candidates = candidates;
          this.sortedCandidates = [...candidates];
          this.sortBy('status');
        },
        error: (error) => {
          console.error('Error loading candidates:', error);
          this.snackBar.open('Error al cargar los candidatos', 'Cerrar', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  sortBy(column: SortColumn): void {
    if (this.currentSortColumn === column) {
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.currentSortDirection = 'asc';
    }

    this.applySorting();
  }

  private applySorting(): void {
    if (!this.currentSortColumn) return;

    this.sortedCandidates = [...this.candidates].sort((a, b) => {
      let comparison = 0;

      switch (this.currentSortColumn) {
        case 'name':
          comparison = this.compareByName(a, b);
          break;
        case 'date':
          comparison = this.compareByDate(a, b);
          break;
        case 'status':
          comparison = this.compareByStatus(a, b);
          break;
      }

      return this.currentSortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private compareByName(a: Candidate, b: Candidate): number {
    const nameA = `${a.name} ${a.surname1} ${a.surname2}`.toLowerCase();
    const nameB = `${b.name} ${b.surname1} ${b.surname2}`.toLowerCase();
    return nameA.localeCompare(nameB);
  }

  private compareByDate(a: Candidate, b: Candidate): number {
    const dateA = `${a.dateAdded}`.toLowerCase();
    const dateB = `${b.dateAdded}`.toLowerCase();
    return dateB.localeCompare(dateA);
  }

  private compareByStatus(a: Candidate, b: Candidate): number {
    const getStatusPriority = (status: boolean | null): number => {
      if (status === true) return 1; 
      if (status === false) return 2; 
      return 3;
    };

    const priorityA = getStatusPriority(a.valid);
    const priorityB = getStatusPriority(b.valid);
    
    return priorityA - priorityB;
  }

  getSortIcon(column: SortColumn): string {
    if (this.currentSortColumn !== column) {
      return 'unfold_more';
    }
    return this.currentSortDirection === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

  getSortClass(column: SortColumn): string {
    if (this.currentSortColumn === column) {
      return `sort-active sort-${this.currentSortDirection}`;
    }
    return 'sort-inactive';
  }

 aceptCandidate(candidate: Candidate) {
    const lastOption = candidate.valid;
    candidate.valid = true;
    this.offerService.updateCandidateStatus(this.offerId!, candidate).subscribe({
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
    this.offerService.updateCandidateStatus(this.offerId!, candidate).subscribe({
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
    this.offerService.updateCandidateStatus(this.offerId!, candidate).subscribe({
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
}