import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth-interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...appConfig.providers || [],
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch((err) => console.error(err));