import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { ChartConfiguration, ChartData } from 'chart.js';
import { OfferService } from "../../services/offer.service";
import { MonthlyCountDTO } from 'src/app/models/metrics.model';


interface ChartColors {
  backgroundColor: string;
  borderColor: string;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  private candidates: MonthlyCountDTO[] = [];
  private offers: MonthlyCountDTO[] = [];
  private acceptedCandidatesMonthly: MonthlyCountDTO[] = [];

  totalAcceptedCandidates: number = 0;
  totalOffers: number = 0;
  totalCandidates: number = 0;
  averageCandidatesPerOffer: number = 0;
  currentYear: number = new Date().getFullYear();

  private readonly monthLabels = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  private readonly chartColors = {
    acceptedCandidates: { backgroundColor: 'rgba(59, 130, 246, 0.55)', borderColor: '#2563eb' },
    offers: { backgroundColor: 'rgba(229, 70, 70, 0.1)', borderColor: '#dc2626', pointBackgroundColor: 'rgb(229, 70, 70)', pointBorderColor: '#ffffff' },
    candidates: { backgroundColor: 'rgba(13, 148, 137, 0.55)', borderColor: '#0d9488' }
  };

  public acceptedCandidatesChartData!: ChartData<'bar'>;
  public acceptedCandidatesChartOptions!: ChartConfiguration<'bar'>['options'];
  public offersChartData!: ChartData<'line'>;
  public offersChartOptions!: ChartConfiguration<'line'>['options'];
  public candidatesChartData!: ChartData<'bar'>;
  public candidatesChartOptions!: ChartConfiguration<'bar'>['options'];

  constructor(
    private adminService: AdminService,
    private offerService: OfferService,
    private cdr: ChangeDetectorRef
  ) { 
    this.acceptedCandidatesChartData = this.createBarChartData('Candidatos Aceptados', this.chartColors.acceptedCandidates);
    this.acceptedCandidatesChartOptions = this.getBaseBarChartOptions('#2563eb');
    
    this.offersChartData = this.createLineChartData('Ofertas Publicadas', this.chartColors.offers);
    this.offersChartOptions = this.getBaseLineChartOptions('#4f46e5');
    
    this.candidatesChartData = this.createBarChartData('Candidatos Registrados', this.chartColors.candidates);
    this.candidatesChartOptions = this.getBaseBarChartOptions('#10b981');
  }

  private getBaseBarChartOptions(borderColor: string): ChartConfiguration<'bar'>['options'] {
    return {
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
          borderColor: borderColor,
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
  }

  private getBaseLineChartOptions(borderColor: string): ChartConfiguration<'line'>['options'] {
    return {
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
          borderColor: borderColor,
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
  }

  private createBarChartData(label: string, colors: ChartColors): ChartData<'bar'> {
    return {
      labels: this.monthLabels,
      datasets: [{
        data: Array(12).fill(0),
        label: label,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  }

  private createLineChartData(label: string, colors: ChartColors): ChartData<'line'> {
    return {
      labels: this.monthLabels,
      datasets: [{
        data: Array(12).fill(0),
        label: label,
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.pointBackgroundColor,
        pointBorderColor: colors.pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };
  }

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

  private calculateTotalForCurrentYear(data: MonthlyCountDTO[]): number {
    return data
      .filter(item => item.year === this.currentYear)
      .reduce((acc, item) => acc + item.count, 0);
  }

   
  private updateBarChartData(data: MonthlyCountDTO[], chartType: 'candidates' | 'acceptedCandidates'): void {
    const monthlyCounts = Array(12).fill(0);
    data.forEach(item => {
      if (item.year === this.currentYear && item.month >= 1 && item.month <= 12) {
        monthlyCounts[item.month - 1] = item.count;
      }
    });
    
    if (chartType === 'candidates') {
      this.candidatesChartData = this.createBarChartData('Candidatos Registrados', this.chartColors.candidates);
      this.candidatesChartData.datasets[0].data = monthlyCounts;
    } else {
      this.acceptedCandidatesChartData = this.createBarChartData('Candidatos Aceptados', this.chartColors.acceptedCandidates);
      this.acceptedCandidatesChartData.datasets[0].data = monthlyCounts;
    }
    
  }

  private updateLineChartData(data: MonthlyCountDTO[]): void {
    const monthlyCounts = Array(12).fill(0);
    data.forEach(item => {
      if (item.year === this.currentYear && item.month >= 1 && item.month <= 12) {
        monthlyCounts[item.month - 1] = item.count;
      }
    });
  
    this.offersChartData = this.createLineChartData('Ofertas Publicadas', this.chartColors.offers);
    this.offersChartData.datasets[0].data = monthlyCounts;
  }
  
  private loadCandidatesData(): void {
    this.adminService.getCandidatesOffers().subscribe({
      next: (candidates: MonthlyCountDTO[]) => {
        this.candidates = candidates;
        this.totalCandidates = this.calculateTotalForCurrentYear(candidates);
        this.updateBarChartData(candidates, 'candidates');
      },
      error: (error) => {
        console.error('Error al cargar los candidatos por mes:', error);}
    });
  }

  private loadAcceptedCandidatesMonthly(): void {
    this.adminService.getMonthlyAcceptedCandidates().subscribe({
      next: (monthlyData: MonthlyCountDTO[]) => {
        this.acceptedCandidatesMonthly = monthlyData;
        this.totalAcceptedCandidates = this.calculateTotalForCurrentYear(monthlyData);
        this.updateBarChartData(monthlyData, 'acceptedCandidates');
      },
      error: (error) => {
        console.error('Error al cargar los candidatos aceptados por mes:', error);
      }
    });
  }

  private loadPublicationsData(): void {
    this.offerService.getMetricsOffer().subscribe({
      next: (monthlyData: MonthlyCountDTO[]) => {
        this.offers = monthlyData;
        this.totalOffers = this.calculateTotalForCurrentYear(monthlyData);
        this.updateLineChartData(monthlyData);
      },
      error: (error) => {
        console.error('Error al cargar las ofertas por mes:', error);
      }
    });
  }
}
