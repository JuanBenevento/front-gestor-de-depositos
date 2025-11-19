import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { UbicacionService } from '../../../core/services/ubicacion.service';
import { Ubicacion } from '../../../core/models/ubicacion/ubicacion.model';

interface UbicacionVisual {
  id: number;
  codigo: string;
  capacidad: number;
  ocupado: number;
}

interface ZonaVisual {
  id: number;
  nombre: string;
  descripcion?: string;
  ubicaciones: UbicacionVisual[];
}

@Component({
  selector: 'app-zones-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './zones-map.component.html',
  styleUrl: './zones-map.component.css'
})
export class ZonesMapComponent implements OnInit {
  private readonly ubicacionService = inject(UbicacionService);

  zonas: ZonaVisual[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadZonas();
  }

  private loadZonas(): void {
    this.loading = true;
    this.error = '';

    this.ubicacionService
      .listar()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ubicaciones => {
          this.zonas = this.mapUbicacionesToZonas(ubicaciones);
        },
        error: () => {
          this.error = 'No se pudo obtener la información de zonas.';
          this.zonas = [];
        }
      });
  }

  private mapUbicacionesToZonas(ubicaciones: Ubicacion[]): ZonaVisual[] {
    const zonasMap = new Map<number, ZonaVisual>();

    for (const ubicacion of ubicaciones) {
      const zonaId = ubicacion.zona?.idZona ?? 0;
      const zonaNombre = ubicacion.zona?.nombre ?? 'Zona sin asignar';
      const zonaDescripcion = ubicacion.zona?.descripcion ?? 'Sin descripción';

      if (!zonasMap.has(zonaId)) {
        zonasMap.set(zonaId, {
          id: zonaId,
          nombre: zonaNombre,
          descripcion: zonaDescripcion,
          ubicaciones: []
        });
      }

      const zona = zonasMap.get(zonaId);
      if (!zona) continue;

      zona.ubicaciones.push({
        id: ubicacion.idUbicacion ?? Number(`${zonaId}${zona.ubicaciones.length}`),
        codigo: ubicacion.codigo,
        capacidad: ubicacion.capacidadMaxima,
        ocupado: ubicacion.ocupadoActual
      });
    }

    return Array.from(zonasMap.values()).map(zona => ({
      ...zona,
      ubicaciones: [...zona.ubicaciones].sort((a, b) => a.codigo.localeCompare(b.codigo))
    }));
  }

  trackByZona(index: number, zona: ZonaVisual): number {
    return zona.id;
  }

  trackByUbicacion(index: number, ubicacion: UbicacionVisual): number {
    return ubicacion.id;
  }

  getUbicacionEstado(ubicacion: UbicacionVisual): 'low' | 'medium' | 'high' {
    if (!ubicacion.capacidad) {
      return 'low';
    }

    const ratio = ubicacion.ocupado / ubicacion.capacidad;
    if (ratio >= 0.8) {
      return 'high';
    }
    if (ratio >= 0.5) {
      return 'medium';
    }
    return 'low';
  }

  getZonaOcupacion(zona: ZonaVisual): string {
    const totalCapacidad = zona.ubicaciones.reduce((sum, ubicacion) => sum + ubicacion.capacidad, 0);
    if (!totalCapacidad) {
      return '0%';
    }

    const ocupado = zona.ubicaciones.reduce((sum, ubicacion) => sum + ubicacion.ocupado, 0);
    return `${Math.round((ocupado / totalCapacidad) * 100)}%`;
  }

  getZonaCapacidadLibre(zona: ZonaVisual): number {
    return zona.ubicaciones.reduce((sum, ubicacion) => sum + (ubicacion.capacidad - ubicacion.ocupado), 0);
  }
}
