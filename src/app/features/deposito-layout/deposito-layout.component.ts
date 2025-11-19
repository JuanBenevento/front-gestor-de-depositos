import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DepositoLayoutService } from '../../core/services/deposito-layout.service';
import { ZonaLayout } from '../../core/models/deposito-layout/zona-layout.model';
import { UbicacionLayout } from '../../core/models/deposito-layout/ubicacion-layout.model';
import { ProductoStock } from '../../core/models/deposito-layout/producto-stock.model';

@Component({
  selector: 'app-deposito-layout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposito-layout.component.html',
  styleUrls: ['./deposito-layout.component.css']
})
export class DepositoLayoutComponent implements OnInit, OnDestroy {

  layout: ZonaLayout[] = [];
  subs = new Subscription();

  // estado UI
  selectedZonaId: number | null = null;
  selectedUbicacionId: number | null = null;

  // drag state
  private draggingUbicacionId: number | null = null;
  private dragOffset = { x: 0, y: 0 };

  // meta local (width/height, customColor por ubicacion, capacidadMax modificada en UI)
  private META_KEY = 'mapa-deposito-meta-v1';
  metaMap: Record<number, { w: number; h: number; color?: string; capacidadMaxima?: number }> = {};

  // formulario / inputs temporales
  zonaEdit = { idZona: 0, nombre: '', color: '' };
  ubicacionEdit = { idUbicacion: 0, codigo: '', w: 140, h: 70, capacidadMaxima: 0 };

  // --------- NUEVAS PROPIEDADES (búsqueda + modal) ----------
  searchTerm = '';
  filteredZonas: ZonaLayout[] = [];
  zonaSearchSelected: ZonaLayout | null = null;
  ubicacionInventario: UbicacionLayout | null = null;

  // modal resize zona
  zonaResizeModal = false;
  zonaScaleX = 1;
  zonaScaleY = 1;
  zonaEditing: ZonaLayout | null = null;

  constructor(private layoutService: DepositoLayoutService) {}

  ngOnInit(): void {
    this.loadMeta();
    this.loadLayout();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this._removeWindowListeners();
  }

  // ---------------- meta ----------------
  private _ensureMeta(idUbicacion: number): void {
    if (!this.metaMap[idUbicacion]) {
      this.metaMap[idUbicacion] = { w: 140, h: 70 };
    }
  }

  private loadMeta(): void {
    const meta = localStorage.getItem(this.META_KEY);
    if (meta) {
      try { this.metaMap = JSON.parse(meta); } catch { this.metaMap = {}; }
    }
  }

  private saveMeta(): void {
    try {
      localStorage.setItem(this.META_KEY, JSON.stringify(this.metaMap));
    } catch (e) {
      console.warn('No se pudo guardar metaMap', e);
    }
  }

  // ---------------- layout ----------------
  loadLayout() {
    this.subs.add(
      this.layoutService.getLayout().subscribe(zs => {
        this.layout = zs;
        // aplicar meta (w,h,color,capacidad) si existen
        for (const zona of this.layout) {
          for (const u of zona.ubicaciones) {
            const m = this.metaMap[u.idUbicacion];
            if (m) {
              (u as any).w = m.w;
              (u as any).h = m.h;
              if (m.capacidadMaxima !== undefined) u.capacidadMaxima = m.capacidadMaxima;
              if (m.color) (zona as any).color = m.color;
            } else {
              // defaults si no existen
              (u as any).w = (u as any).w ?? 140;
              (u as any).h = (u as any).h ?? 70;
            }
          }
        }
        // si hay término de búsqueda activo, actualizar la lista
        if (this.searchTerm) this.filterZonas();
      })
    );
  }

  // ---------------- Drag & Drop (Pointer Events) ----------------
  startDrag(u: UbicacionLayout, ev: PointerEvent) {
    ev.preventDefault();
    this.draggingUbicacionId = u.idUbicacion;

    this.dragOffset.x = ev.clientX - (u.x || 0);
    this.dragOffset.y = ev.clientY - (u.y || 0);

    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  }

  private _onPointerMove = (ev: PointerEvent) => {
    if (this.draggingUbicacionId == null) return;
    ev.preventDefault();
    const id = this.draggingUbicacionId;
    const newX = ev.clientX - this.dragOffset.x;
    const newY = ev.clientY - this.dragOffset.y;

    for (const zona of this.layout) {
      const u = zona.ubicaciones.find(x => x.idUbicacion === id);
      if (u) {
        u.x = Math.max(4, Math.min(2000, newX));
        u.y = Math.max(4, Math.min(2000, newY));
        break;
      }
    }
  }

  private _onPointerUp = (_ev: PointerEvent) => {
    if (this.draggingUbicacionId == null) return;
    const id = this.draggingUbicacionId;
    const u = this._findUbicacionById(id);
    if (u) {
      this.layoutService.saveCoordsLocal(id, u.x, u.y);
    }
    this.draggingUbicacionId = null;
    this._removeWindowListeners();
  }

  private _removeWindowListeners() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  private _findUbicacionById(id: number) {
    for (const zona of this.layout) {
      const u = zona.ubicaciones.find(x => x.idUbicacion === id);
      if (u) return u;
    }
    return null;
  }

  // ---------------- Selecciones y edición ----------------
  // modificada: ahora abre modal de resize de zona también
  selectZona(z: ZonaLayout) {
    this.selectedZonaId = z.idZona;
    this.zonaEdit = { idZona: z.idZona, nombre: z.nombre, color: (z as any).color || '#999999' };

    // abrir modal para ajustar tamaño de la zona
    this.zonaEditing = z;
    this.zonaScaleX = 1;
    this.zonaScaleY = 1;
    this.zonaResizeModal = true;
  }

  saveZonaEdits() {
    if (this.selectedZonaId == null) return;
    const z = this.layout.find(z => z.idZona === this.selectedZonaId);
    if (!z) return;
    z.nombre = this.zonaEdit.nombre;
    (z as any).color = this.zonaEdit.color;

    // actualizar metaMap para que color persista al exportar/importar
    for (const u of z.ubicaciones) {
      this._ensureMeta(u.idUbicacion);
      this.metaMap[u.idUbicacion].color = this.zonaEdit.color;
    }
    this.saveMeta();
  }

  // ---------------- Export / Import / Reset ----------------
  exportAll(): void {
    try {
      const json = this.layoutService.exportLayoutJSON(this.layout);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deposito-layout.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al exportar layout', e);
    }
  }

  importFile(file?: File | null): void {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const ok = this.layoutService.importLayoutJSON(text);
      if (ok) {
        this.loadLayout();
        alert('Importación completada');
      } else {
        alert('Archivo inválido');
      }
    };
    reader.onerror = (e) => {
      console.error('Error leyendo archivo', e);
      alert('No se pudo leer el archivo');
    };
    reader.readAsText(file);
  }

  resetLocal(): void {
    if (!confirm('Eliminar datos locales de layout?')) return;
    this.layoutService.clearLocalLayout();
    try { localStorage.removeItem(this.META_KEY); } catch {}
    this.metaMap = {};
    this.loadLayout();
  }

  // ---------------- Ubicaciones (add/remove/edit) ----------------
  addUbicacionToZona(): void {
    if (this.selectedZonaId == null) {
      alert('Seleccione una zona primero');
      return;
    }
    const z = this.layout.find(x => x.idZona === this.selectedZonaId);
    if (!z) return;
    const newId = Date.now(); // id temporal en frontend
    const nueva: UbicacionLayout = {
      idUbicacion: newId,
      codigo: 'U' + newId,
      capacidadMaxima: 0,
      ocupadoActual: 0,
      productos: [],
      x: 40,
      y: 40,
      w: 140,
      h: 70
    } as any;
    z.ubicaciones.push(nueva);
    this._ensureMeta(nueva.idUbicacion);
    this.saveMeta();
  }

  selectUbicacion(u: UbicacionLayout): void {
    this.selectedUbicacionId = u.idUbicacion;
    this.ubicacionEdit = {
      idUbicacion: u.idUbicacion || 0,
      codigo: u.codigo || '',
      w: (u as any).w || 140,
      h: (u as any).h || 70,
      capacidadMaxima: u.capacidadMaxima || 0
    };
    // limpiamos el panel de inventario si seleccionas por el mapa
    this.ubicacionInventario = null;
  }

  removeUbicacion(u: UbicacionLayout): void {
    for (const z of this.layout) {
      const idx = z.ubicaciones.findIndex(x => x.idUbicacion === u.idUbicacion);
      if (idx >= 0) {
        z.ubicaciones.splice(idx, 1);
        delete this.metaMap[u.idUbicacion];
        this.saveMeta();
        break;
      }
    }
  }

  saveUbicacionEdits(): void {
    if (this.selectedUbicacionId == null) return;
    const u = this._findUbicacionById(this.selectedUbicacionId);
    if (!u) return;
    u.codigo = this.ubicacionEdit.codigo;
    (u as any).w = this.ubicacionEdit.w;
    (u as any).h = this.ubicacionEdit.h;
    u.capacidadMaxima = this.ubicacionEdit.capacidadMaxima;
    // actualizar metaMap
    this._ensureMeta(u.idUbicacion);
    this.metaMap[u.idUbicacion].w = (u as any).w;
    this.metaMap[u.idUbicacion].h = (u as any).h;
    this.metaMap[u.idUbicacion].capacidadMaxima = u.capacidadMaxima;
    this.saveMeta();
  }

  // ---------------- BÚSQUEDA Y DETALLES ----------------
  filterZonas() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredZonas = [];
      this.zonaSearchSelected = null;
      return;
    }
    this.filteredZonas = this.layout.filter(z => (z.nombre || '').toLowerCase().includes(term));
  }

  selectZonaFromSearch(z: ZonaLayout) {
    this.zonaSearchSelected = z;
    this.ubicacionInventario = null;
  }

  showInventario(u: UbicacionLayout) {
    // como el objeto u ya trae productos desde servicio, lo mostramos directo
    this.ubicacionInventario = u;
    // opcional: si necesitás refrescar desde backend, podés llamar a inventarioService aquí
  }

  // ----------------- Modal de resize de zona -----------------
  applyZonaScale() {
    if (!this.zonaEditing) return;
    for (const u of this.zonaEditing.ubicaciones) {
      // aplicamos escala y guardamos en metaMap
      (u as any).w = Math.max(20, Math.round(((u as any).w || 140) * this.zonaScaleX));
      (u as any).h = Math.max(10, Math.round(((u as any).h || 70) * this.zonaScaleY));

      this._ensureMeta(u.idUbicacion);
      this.metaMap[u.idUbicacion].w = (u as any).w;
      this.metaMap[u.idUbicacion].h = (u as any).h;
    }
    this.saveMeta();
    this.closeResizeModal();
  }

  closeResizeModal() {
    this.zonaResizeModal = false;
    this.zonaEditing = null;
  }

}
