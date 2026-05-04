import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { HotelsComponent } from './pages/hotels/hotels.component';
import { HotelDetailComponent } from './pages/hotel-detail/hotel-detail.component';
import { HotelFormComponent } from './pages/hotel-form/hotel-form.component';
import { HotelAdminComponent } from './pages/hotel-admin/hotel-admin.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ConfirmationComponent } from './pages/confirmation/confirmation.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'rooms', component: RoomsComponent },

  // ─── Hotel Routes ───────────────────────────────────────────────
  { path: 'hotels', component: HotelsComponent },
  { path: 'hotels/:id', component: HotelDetailComponent },
  { path: 'hotel-admin', component: HotelAdminComponent, canActivate: [authGuard] },
  { path: 'hotel-form', component: HotelFormComponent, canActivate: [authGuard] },
  { path: 'hotel-form/:id', component: HotelFormComponent, canActivate: [authGuard] },
  // ────────────────────────────────────────────────────────────────

  { path: 'reviews', component: ReviewsComponent },
  { path: 'checkout/:roomId', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'confirmation', component: ConfirmationComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'dashboard/reservation/:id', component: ReservationDetailComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];
