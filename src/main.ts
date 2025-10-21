import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => console.log('Aplicación Angular inicializada'))
  .catch((err) => console.error('Error al iniciar la app:', err));
