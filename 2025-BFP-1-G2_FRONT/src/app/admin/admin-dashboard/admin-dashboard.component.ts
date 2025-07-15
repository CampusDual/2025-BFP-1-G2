import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Offer, OfferService } from "../../services/offer.service";
import { Candidate } from "../../detailed-card/detailed-card.component";

export interface MonthlyClosedOffersDTO {
  month: number;
  year: number;
  count: number;
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

  private candidates: Candidate[] = [];
  private offers: ExtendedOffer[] = [];

  private acceptedCandidatesMonthly: MonthlyClosedOffersDTO[] = [];

  totalAcceptedCandidates: number = 0;

  totalOffers: number = 0;
  totalCandidates: number = 0;
  activeOffers: number = 0;
  averageCandidatesPerOffer: number = 0;
  currentYear: number = new Date().getFullYear();

  constructor(
    private adminService: AdminService,
    private offerService: OfferService,
  ) { }

  public acceptedCandidatesChartData: ChartData<'bar'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Candidatos Aceptados',
      backgroundColor: 'rgba(59, 130, 246, 0.55)',
      borderColor: '#2563eb',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  public acceptedCandidatesChartOptions: ChartConfiguration<'bar'>['options'] = {
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
        borderColor: '#2563eb',
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

  public offersChartData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Ofertas Publicadas',
      borderColor: '#dc2626',
      backgroundColor: 'rgba(229, 70, 70, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(229, 70, 70)',
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


  public candidatesChartData: ChartData<'bar'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Candidatos Registrados',
      backgroundColor: 'rgba(13, 148, 137, 0.55)',
      borderColor: '#0d9488',
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

  public offersStatusChartData: ChartData<'doughnut'> = {
    labels: ['Ofertas Activas', 'Ofertas con Candidatos', 'Ofertas Sin Candidatos'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        '#4f46e5',
        '#3b82f6',
        '#f59e0b'
      ],
      borderColor: [
        '#4f46e5',
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
    this.loadCandidatesData();
    this.loadPublicationsData();
    this.loadAcceptedCandidatesMonthly();
  }



  private loadCandidatesData(): void {
    this.adminService.getCandidatesOffers().subscribe({
      next: (candidates: Candidate[]) => {
        if (!candidates || candidates.length === 0) {
          console.warn('No se encontraron candidatos');
          return;
        }
        this.candidates = candidates;
        console.log('Candidatos cargados:', this.candidates);
        this.totalCandidates = candidates.length;
        this.updateCandidatesChart();
      },
      error: (error) => {
        console.error('Error al cargar los candidatos:', error);
      }
    });
  }

  private loadAcceptedCandidatesMonthly(): void {
    this.adminService.getMonthlyAcceptedCandidates().subscribe({
      next: (monthlyData: MonthlyClosedOffersDTO[]) => {
        this.acceptedCandidatesMonthly = monthlyData;
        this.totalAcceptedCandidates = monthlyData
          .filter(item => item.year === this.currentYear)
          .reduce((acc, item) => acc + item.count, 0);
        this.updateAcceptedCandidatesChart();
      },
      error: (error) => {
        console.error('Error al cargar los candidatos aceptados por mes:', error);
      }
    });
  }

  private updateAcceptedCandidatesChart(): void {
    const currentYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0);
    this.acceptedCandidatesMonthly.forEach(item => {
      if (item.year === currentYear && item.month >= 1 && item.month <= 12) {
        monthlyCounts[item.month - 1] = item.count;
      }
    });
    this.acceptedCandidatesChartData = {
      ...this.acceptedCandidatesChartData,
      datasets: [{
        ...this.acceptedCandidatesChartData.datasets[0],
        data: monthlyCounts
      }]
    };
  }

  private loadPublicationsData(): void {
    this.offerService.getAllOffers().subscribe({
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



}
