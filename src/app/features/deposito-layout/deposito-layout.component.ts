import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DepositoLayoutService } from '../../core/services/deposito-layout.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ZonaLayout } from '../../core/models/deposito-layout/zona-layout.model';
import { UbicacionLayout } from '../../core/models/deposito-layout/ubicacion-layout.model';

@Component({
  selector: 'app-deposito-layout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deposito-layout.component.html',
  styleUrls: ['./deposito-layout.component.css']
})
export class DepositoLayoutComponent implements OnInit, OnDestroy {

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  layout: ZonaLayout[] = [];
  subs = new Subscription();

  selectedUbicacion: UbicacionLayout | null = null;
  selectedZona: ZonaLayout | null = null;

  inventarioDetalle: any[] = [];
  loadingInventario = false;

  gridSize = 20;
  scale = 1;    
  panning = false;
  panOrigin = { x: 0, y: 0 };
  translate = { x: 0, y: 0 };

  draggingUbicacion: UbicacionLayout | null = null;
  dragOffset = { x: 0, y: 0 };

  private META_KEY = 'mapa-deposito-meta-v2';
  metaMap: Record<number, { x: number, y: number, w: number; h: number, color?: string }> = {};

  constructor(
    private layoutService: DepositoLayoutService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.loadMeta();
    this.loadLayout();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadLayout() {
    this.subs.add(
      this.layoutService.getLayout().subscribe(zs => {
        this.layout = zs;
        this.aplicarMetaDatos();
      })
    );
  }

  private loadMeta(): void {
    const meta = localStorage.getItem(this.META_KEY);
    if (meta) {
      try { this.metaMap = JSON.parse(meta); } catch { this.metaMap = {}; }
    }
  }

  private aplicarMetaDatos() {
    this.layout.forEach(z => {
      z.color = z.color || '#64748b'; 

      z.ubicaciones.forEach(u => {
        const m = this.metaMap[u.idUbicacion];
        if (m) {
          u.x = m.x; u.y = m.y; u.w = m.w; u.h = m.h;
          if(m.color) z.color = m.color; 
        } else {
          u.x = u.x || 50; u.y = u.y || 50; 
          u.w = 120; u.h = 60;
        }
      });
    });
  }

  private saveMeta(): void {
    this.layout.forEach(z => {
      z.ubicaciones.forEach(u => {
        this.metaMap[u.idUbicacion] = { 
          x: u.x, y: u.y, w: u.w, h: u.h, color: z.color
        };
      });
    });
    localStorage.setItem(this.META_KEY, JSON.stringify(this.metaMap));
  }
  
  zoomIn() { this.scale = Math.min(this.scale + 0.1, 3); }
  zoomOut() { this.scale = Math.max(this.scale - 0.1, 0.3); }
  resetView() { this.scale = 1; this.translate = { x: 0, y: 0 }; }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) { 
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      this.scale = Math.max(0.3, Math.min(3, this.scale + delta));
    }
  }

  startPan(event: MouseEvent) {
    if ((event.target as HTMLElement).tagName === 'svg') {
      this.panning = true;
      this.panOrigin = { x: event.clientX - this.translate.x, y: event.clientY - this.translate.y };
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.panning) {
      event.preventDefault();
      this.translate.x = event.clientX - this.panOrigin.x;
      this.translate.y = event.clientY - this.panOrigin.y;
    }
    if (this.draggingUbicacion) {
      event.preventDefault();
      const deltaX = (event.clientX - this.dragOffset.x) / this.scale;
      const deltaY = (event.clientY - this.dragOffset.y) / this.scale;
      this.draggingUbicacion.x = Math.round(deltaX / this.gridSize) * this.gridSize;
      this.draggingUbicacion.y = Math.round(deltaY / this.gridSize) * this.gridSize;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.panning = false;
    if (this.draggingUbicacion) {
      this.saveMeta(); 
      this.draggingUbicacion = null;
    }
  }


  startDragUbicacion(event: MouseEvent, u: UbicacionLayout) {
    event.stopPropagation(); 
    if (event.button === 0) {
      this.draggingUbicacion = u;
      this.dragOffset.x = event.clientX - (u.x * this.scale);
      this.dragOffset.y = event.clientY - (u.y * this.scale);
      this.selectUbicacion(u);
    }
  }

  selectUbicacion(u: UbicacionLayout) {
    this.selectedUbicacion = u;
    this.selectedZona = null;
    this.cargarInventario(u);
  }

  selectZona(z: ZonaLayout) {
    this.selectedZona = z;
    this.selectedUbicacion = null;
  }

  cargarInventario(u: UbicacionLayout) {
    this.loadingInventario = true;
    this.inventarioDetalle = [];
    this.inventarioService.listar().subscribe({
      next: (inv) => {
        this.inventarioDetalle = inv
          .filter(i => i.ubicacion.idUbicacion === u.idUbicacion)
          .map(i => ({
            producto: i.producto.nombre,
            sku: i.producto.codigoSku,
            cantidad: i.cantidad
          }));
        this.loadingInventario = false;
      },
      error: () => this.loadingInventario = false
    });
  }

  getFillColor(u: UbicacionLayout): string {
    if (this.selectedUbicacion?.idUbicacion === u.idUbicacion) return '#3b82f6';
    
    if (u.capacidadMaxima <= 0) return '#334155'; 
    
    const porcentaje = u.ocupadoActual / u.capacidadMaxima;
    
    if (porcentaje >= 1) return '#ef4444';
    if (porcentaje >= 0.75) return '#f97316'; 
    if (porcentaje >= 0.50) return '#eab308'; 
    return '#10b981'; 
  }

  getOpacity(u: UbicacionLayout): number {
    if (this.selectedZona && this.selectedZona.ubicaciones.every(uz => uz.idUbicacion !== u.idUbicacion)) {
      return 0.3;
    }
    return 1;
  }

  updateDimension(dimension: 'w'|'h', value: number) {
    if (this.selectedUbicacion) {
      this.selectedUbicacion[dimension] = value;
      this.saveMeta();
    }
  }
}