import { Component, OnInit } from '@angular/core';
import { MatChipEditedEvent } from '@angular/material/chips';
import { FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ChartConfiguration} from 'chart.js';
import {Offer, OfferService} from "../../services/offer.service";
import {Candidate} from "../../detailed-card/detailed-card.component";

export interface Tag {
  name: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  tags: Tag[] = [];
  tag = new FormControl('', [Validators.required, Validators.minLength(2)]);

  private candidates: Candidate [] = [];
  private offers: Offer [] = [];

  constructor(
    private adminService: AdminService,
    private offerService: OfferService) {}

  public candidatesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Candidatos por Mes',
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  public publicationsChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      data: Array(12).fill(0),
      label: 'Publicaciones por Mes',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  public chartPlugins = [];

  ngOnInit(): void {
    this.loadTags();
    this.loadCandidatesData();
    this.loadPublicationsData();
  }

  private loadCandidatesData(): void {
    this.adminService.getCandidatesOffers().subscribe({
      next: (candidates: Candidate []) => {
        if (!candidates || candidates.length === 0) {
          console.warn('No se encontraron candidatos');
          return;
        }
        this.candidates = candidates;
        this.updateCandidatesChart();
      },
      error: (error) => {
        console.error('Error al cargar los candidatos:', error);
      }
    });
  }

  private loadPublicationsData(): void {
    this.offerService.getOffers().subscribe({
      next: (publications: Offer []) => {
        if (!publications || publications.length === 0) {
          console.warn('No se encontraron publicaciones');
          return;
        }
        this.offers = publications;
        this.updatePublicationsChart();
      },
      error: (error) => {
        console.error('Error al cargar las publicaciones:', error);
      }
    });
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

  private updatePublicationsChart(): void {
    const currentYear = new Date().getFullYear();
    const monthlyData = this.getDataByMonth(this.offers, currentYear);

    this.publicationsChartData = {
      ...this.publicationsChartData,
      datasets: [{
        ...this.publicationsChartData.datasets[0],
        data: monthlyData.map(data => data.count)
      }]
    };
  }

  private getDataByMonth(data: Array<Candidate | Offer>, year: number): { month: number; count: number; }[] {
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

  loadTags(): void {
    this.adminService.getAllTags().subscribe({
      next: (tags: Tag[]) => {
        this.tags = tags;
      },
      error: (error) => {
        console.error('Error al obtener los tags:', error);
      }
    });
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
      } else {
        console.warn('El tag ya existe');
      }
    }
  }

  remove(tag: Tag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
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
      }
    } else {
      console.warn('El tag ya existe');
    }
  }
}
