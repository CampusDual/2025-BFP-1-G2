import { Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent } from '@angular/material/chips';
import { FormControl, Validators } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Tag {
  id?: number;
  name: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {


  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: Tag[] = [];
  tag = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor(private adminService: AdminService,
    private matSnackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadTags();

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
      this.adminService.createTag({ name: value }).subscribe(
        () => {
          this.loadTags();
          this.tag.reset();
          this.matSnackBar.open('Etiqueta creada exitosamente', 'Cerrar', {
            duration: 3000
          });
        },
        () => {
          if (this.tags.some(existingTag => existingTag.name.toLowerCase() === value.toLowerCase())) {
            this.matSnackBar.open('La etiqueta ya existe', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
          else this.matSnackBar.open('Error al crear la etiqueta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }
  }


  remove(tag: Tag): void {
    if (!tag.id) {
      console.warn('No se puede eliminar un tag sin ID');
      return;
    }
    this.adminService.deleteTag(tag.id).subscribe(
      () => {
        this.matSnackBar.open('Etiqueta eliminada exitosamente', 'Cerrar', {
          duration: 3000
        });
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
          this.tags.splice(index, 1);
        }
      },
      (error) => {
        console.error('Error al eliminar la etiqueta:', error);
        this.matSnackBar.open('Error al eliminar la etiqueta', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  edit(tag: Tag, event: MatChipEditedEvent): void {
    const value = event.value.trim();
    if (!value) {
      this.remove(tag);
      return;
    }
    if (value && tag.id) {
      const updatedTag: Tag = { ...tag, name: value };
      this.adminService.updateTag(updatedTag).subscribe(
        () => {
          this.loadTags();
          this.matSnackBar.open('Etiqueta actualizada exitosamente', 'Cerrar', {
            duration: 3000
          });
        },
        () => {
          this.matSnackBar.open('Error al actualizar la etiqueta', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }

  }
}
