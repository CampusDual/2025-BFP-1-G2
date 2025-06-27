import { Component, OnInit } from '@angular/core';
import { MatChipEditedEvent } from '@angular/material/chips';
import { FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Offer, OfferService } from "../../services/offer.service";
import { Candidate } from "../../detailed-card/detailed-card.component";

export interface Tag {
  id?: number;
  name: string;
}

export interface ExtendedOffer extends Offer {
  id?: number;
  candidatesCount?: number;
  candidates?: Candidate[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  tags: Tag[] = [];
  tag = new FormControl('', [Validators.required, Validators.minLength(2)]);

  private candidates: Candidate[] = [];
  private offers: ExtendedOffer[] = [];

  // Estadísticas generales
  totalOffers: number = 0;
  totalCandidates: number = 0;
  activeOffers: number = 0;
  averageCandidatesPerOffer: number = 0;
  currentYear: number = new Date().getFullYear();

  constructor(
    private adminService: AdminService,
    private offerService: OfferService,
    private matSnackBar: MatSnackBar
  ) {}

  // Gráfica de ofertas por mes - Línea con área
  public offersChartData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Ofertas Publicadas',
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#4f46e5',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  public offersChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4f46e5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Gráfica de candidatos por mes - Barras con gradiente
  public candidatesChartData: ChartData<'bar'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Candidatos Registrados',
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(245, 101, 101, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(252, 211, 77, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(244, 63, 94, 0.8)'
      ],
      borderColor: [
        '#10b981',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#f56565',
        '#fb923c',
        '#fcd34d',
        '#22c55e',
        '#14b8a6',
        '#6366f1',
        '#a855f7',
        '#f43f5e'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  public candidatesChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#6b7280',
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Gráfica de distribución de ofertas por estado - Doughnut
  public offersStatusChartData: ChartData<'doughnut'> = {
    labels: ['Ofertas Activas', 'Ofertas con Candidatos', 'Ofertas Sin Candidatos'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        '#10b981',
        '#3b82f6',
        '#f59e0b'
      ],
      borderColor: [
        '#059669',
        '#2563eb',
        '#d97706'
      ],
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  public offersStatusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#374151',
          font: {
            size: 13
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: true
      }
    },
    cutout: '60%'
  };

  ngOnInit(): void {
    this.loadTags();
    this.loadCandidatesData();
    this.loadPublicationsData();
  }

  private loadCandidatesData(): void {
    this.adminService.getCandidatesOffers().subscribe({
      next: (candidates: Candidate[]) => {
        if (!candidates || candidates.length === 0) {
          console.warn('No se encontraron candidatos');
          return;
        }
        this.candidates = candidates;
        this.totalCandidates = candidates.length;
        this.updateCandidatesChart();
      },
      error: (error) => {
        console.error('Error al cargar los candidatos:', error);
      }
    });
  }

  private loadPublicationsData(): void {
    this.offerService.getOffers().subscribe({
      next: (publications: ExtendedOffer[]) => {
        if (!publications || publications.length === 0) {
          console.warn('No se encontraron publicaciones');
          return;
        }
        this.offers = publications;
        this.totalOffers = publications.length;
        this.calculateStatistics();
        this.updateOffersChart();
        this.updateOffersStatusChart();
      },
      error: (error) => {
        console.error('Error al cargar las publicaciones:', error);
      }
    });
  }

  private calculateStatistics(): void {
    this.activeOffers = this.offers.length;
    const offersWithCandidates = this.offers.filter(offer => 
      offer.candidatesCount && offer.candidatesCount > 0
    ).length;
    
    this.averageCandidatesPerOffer = this.totalOffers > 0 ? 
      Math.round((this.totalCandidates / this.totalOffers) * 10) / 10 : 0;
  }

  private updateCandidatesChart(): void {
    const currentYear = new Date().getFullYear();
    const monthlyData = this.getDataByMonth(this.candidates, currentYear);
    
    this.candidatesChartData = {
      ...this.candidatesChartData,
      datasets: [{
        ...this.candidatesChartData.datasets[0],
        data: monthlyData.map(data => data.count)
      }]
    };
  }

  private updateOffersChart(): void {
    const currentYear = new Date().getFullYear();
    const monthlyData = this.getDataByMonth(this.offers, currentYear);

    this.offersChartData = {
      ...this.offersChartData,
      datasets: [{
        ...this.offersChartData.datasets[0],
        data: monthlyData.map(data => data.count)
      }]
    };
  }

  private updateOffersStatusChart(): void {
    const offersWithCandidates = this.offers.filter(offer => 
      offer.candidatesCount && offer.candidatesCount > 0
    ).length;
    const offersWithoutCandidates = this.totalOffers - offersWithCandidates;

    this.offersStatusChartData = {
      ...this.offersStatusChartData,
      datasets: [{
        ...this.offersStatusChartData.datasets[0],
        data: [this.totalOffers, offersWithCandidates, offersWithoutCandidates]
      }]
    };
  }

  private getDataByMonth(data: Array<Candidate | ExtendedOffer>, year: number): { month: number; count: number; }[] {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      count: 0
    }));

    data.forEach(item => {
      const date = new Date(item.dateAdded ?? new Date());
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        monthlyData[month].count++;
      }
    });

    return monthlyData;
  }

  loadTags() {
    this.adminService.getAllTags().subscribe(
      (tags: Tag[]) => {
        this.tags = tags.sort((a, b) => a.name.localeCompare(b.name));
      },
      (error) => {
        console.error('Error al obtener los tags:', error);
      }
    );
  }

  add(): void {
    const value = this.tag.value?.toString().trim();

    if (this.tag.valid && value) {
      const exists = this.tags.some(existingTag =>
        existingTag.name.toLowerCase() === value.toLowerCase()
      );

      if (!exists) {
        this.tags.push({ name: value });
        this.tag.reset();
        this.matSnackBar.open('Etiqueta añadida exitosamente', 'Cerrar', {
          duration: 3000
        });
      } else {
        this.matSnackBar.open('La etiqueta ya existe', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  remove(tag: Tag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.matSnackBar.open('Etiqueta eliminada exitosamente', 'Cerrar', {
        duration: 3000
      });
    }
  }

  edit(tag: Tag, event: MatChipEditedEvent): void {
    const value = event.value.trim();

    if (!value) {
      this.remove(tag);
      return;
    }

    const exists = this.tags.some(existingTag =>
      existingTag !== tag && existingTag.name.toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
      const index = this.tags.indexOf(tag);
      if (index >= 0) {
        this.tags[index].name = value;
        this.matSnackBar.open('Etiqueta actualizada exitosamente', 'Cerrar', {
          duration: 3000
        });
      }
    } else {
      this.matSnackBar.open('La etiqueta ya existe', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
