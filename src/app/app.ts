import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalHostComponent } from './shared/components/modal/modal-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalHostComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']  
})
export class App {
  protected title = 'GestorDeDepositos';

  constructor() {
  console.log('AppComponent cargado correctamente');
}
}
