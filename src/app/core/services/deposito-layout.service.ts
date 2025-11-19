import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { ZonaService } from './zona.service';
import { UbicacionService } from './ubicacion.service';
import { InventarioService } from './inventario.service';

import { ZonaLayout } from '../models/deposito-layout/zona-layout.model';
import { UbicacionLayout } from '../models/deposito-layout/ubicacion-layout.model';
import { ProductoStock } from '../models/deposito-layout/producto-stock.model';

const STORAGE_KEY = 'mapa-deposito-layout-v1';

@Injectable({
  providedIn: 'root'
})
export class DepositoLayoutService {

  constructor(
    private zonaService: ZonaService,
    private ubicacionService: UbicacionService,
    private inventarioService: InventarioService
  ) {}

  /**
   * Construye layout usando tus servicios backend existentes y aplica coordenadas desde localStorage si existen.
   */
  getLayout(): Observable<ZonaLayout[]> {
    return forkJoin({
      zonas: this.zonaService.listar(),
      ubicaciones: this.ubicacionService.listar(),
      inventarios: this.inventarioService.listar()
    }).pipe(
      map(({ zonas, ubicaciones, inventarios }) => {
        const coordsMap = this._readCoordsFromStorage();

        return zonas.map(zona => {
          const ubicacionesZona: UbicacionLayout[] = ubicaciones
            .filter(u => u.zona?.idZona === zona.idZona)
            .map(u => {
              const productos: ProductoStock[] = inventarios
                .filter(i => i.ubicacion.idUbicacion === u.idUbicacion)
                .map(i => ({
                  sku: i.producto.codigoSku || 'N/A',
                  nombre: i.producto.nombre || 'Sin nombre',
                  cantidad: i.cantidad
                }));

              const ocupadoActual = productos.reduce((acc, p) => acc + (p.cantidad || 0), 0);

              const saved = u.idUbicacion !== undefined ? coordsMap[u.idUbicacion] : undefined;
              const defaultX = Math.floor(Math.random() * 600) + 20;
              const defaultY = Math.floor(Math.random() * 300) + 20;

              return {
                idUbicacion: u.idUbicacion,
                codigo: u.codigo,
                capacidadMaxima: u.capacidadMaxima,
                ocupadoActual,
                productos,
                x: saved ? saved.x : defaultX,
                y: saved ? saved.y : defaultY
              } as UbicacionLayout;
            });

          return {
            idZona: zona.idZona,
            nombre: zona.nombre,
            descripcion: zona.descripcion,
            color: (zona as any).color || (zona.idZona !== undefined ? this._colorForZona(zona.idZona) : '#000000'),
            ubicaciones: ubicacionesZona
          } as ZonaLayout;
        });
      })
    );
  }

  /**
   * Guarda coordenadas solo en localStorage (prototipo frontend-only).
   */
  saveCoordsLocal(ubicacionId: number, x: number, y: number) {
    const map = this._readCoordsFromStorage();
    map[ubicacionId] = { x, y };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  /**
   * Exporta el JSON con coordenadas y pequeño snapshot del layout
   */
  exportLayoutJSON(layout: ZonaLayout[]) {
    const coords = this._readCoordsFromStorage();
    const payload = { coords, timestamp: new Date().toISOString() };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Importa JSON (formato esperado: { coords: { idUb: {x, y}, ... }})
   */
  importLayoutJSON(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed?.coords && typeof parsed.coords === 'object') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.coords));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  clearLocalLayout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ---- helpers ----
  private _colorForZona(idZona: number): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
    return colors[idZona % colors.length];
  }

  private _readCoordsFromStorage(): Record<number, {x:number,y:number}> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
          const parsed = JSON.parse(raw);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            Object.keys(parsed).every(key => {
              const val = parsed[key];
              return (
                !isNaN(Number(key)) &&
                val &&
                typeof val.x === 'number' &&
                typeof val.y === 'number'
              );
            })
          ) {
            return parsed;
          }
          return {};
        } catch (e) {
          return {};
        }
      }
    }