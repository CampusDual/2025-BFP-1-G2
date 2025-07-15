import { Component } from '@angular/core';
import { TagService } from 'src/app/services/tag.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { MatChipEditedEvent } from '@angular/material/chips';
import { ChartConfiguration, ChartData } from 'chart.js';

export interface Tag {
  id?: number;
  name: string;
  count?: number;
}

@Component({
  selector: 'app-admin-tags',
  templateUrl: './admin-tags.component.html',
  styleUrls: ['./admin-tags.component.css']
})
export class AdminTagsComponent {

  tags: Tag[] = [];
  tag = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor(
    private tagService: TagService,
    private matSnackBar: MatSnackBar) { }

  ngOnInit() {
    this.loadTags();
  }
  
  public countTagsData: ChartData<'bar'> = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: '#4bc0c0',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  
    public countTagsOptions: ChartConfiguration<'bar'>['options'] = {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `Frecuencia: ${context.parsed.y}`
          }
        }
      },
      scales: {
        y: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            }
          }
        },
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(107, 114, 128, 0.1)'
          },
          ticks: {
            stepSize: 1,
            precision: 0
          }
        }
      }
    };

    loadTags() {
    this.tagService.getAllTags().subscribe(
      (tags: Tag[]) => {
        this.tags = tags.sort((a, b) => a.name.localeCompare(b.name));
        this.tagService.getTopTags().subscribe({
          next: (tags: Tag[]) => {
            this.tags.filter(tag => tag.count !== undefined).forEach(tag => {
              const matchingTag = tags.find(t => t.name === tag.name);
              if (matchingTag) {
                tag.count = matchingTag.count;
              } else {
                tag.count = 0;
              }
            });
            this.loadTagsMetrics();
          },
          error: (error) => {
            console.error('Error al cargar tags:', error);
            this.matSnackBar.open('Error al cargar etiquetas', 'Cerrar', {
              duration: 3000
            });
          }
        });
      },
      (error) => {
        console.error('Error al obtener los tags:', error);
      }
    );
  }

   private loadTagsMetrics(): void {
      const sortedTags = [...this.tags].sort((b, a) => a.count && b.count ? a.count - b.count : 0);
      const topTags = sortedTags.slice(0, 10);
      this.countTagsData = {
        labels: topTags.map(tag => tag.name),
        datasets: [{
          data: topTags.map(tag => tag.count || 0),
          label: 'Frecuencia de uso',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: '#4bc0c0',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      };
    }

  add(): void {
    const value = this.tag.value?.toString().trim();
    if (this.tag.valid && value) {
      const exists = this.tags.some(existingTag =>
        existingTag.name.toLowerCase() === value.toLowerCase()
      );
      if (!exists) {
        this.tagService.createTag({ name: value }).subscribe({
          next: (newTag: Tag) => {
            this.tags.push({ name: value });
            this.tag.reset();
            this.matSnackBar.open('Etiqueta añadida exitosamente', 'Cerrar', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error al crear la etiqueta:', error);
            this.matSnackBar.open('Error al añadir la etiqueta', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
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
    this.tagService.deleteTag(tag.id!).subscribe({
      next: () => {
        this.tags.splice(index, 1);
        this.matSnackBar.open('Etiqueta eliminada exitosamente', 'Cerrar', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error al eliminar la etiqueta:', error);
        this.matSnackBar.open('Error al eliminar la etiqueta', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
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
      this.tagService.updateTag({ id: tag.id, name: value }).subscribe({
        next: (updatedTag: Tag) => {
          this.tags[index].name = value;
          this.matSnackBar.open('Etiqueta actualizada exitosamente', 'Cerrar', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error al actualizar la etiqueta:', error);
          this.matSnackBar.open('Error al actualizar la etiqueta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }

  }
}
export interface Tag {
}

