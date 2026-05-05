import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/models';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  username: string = 'User';
  email: string = '';
  role: string = 'USER';
  memberSince: string = '';

  totalBookings: number = 0;
  upcomingBookings: number = 0;
  completedBookings: number = 0;
  isLoading = true;

  recentReservations: Reservation[] = [];

  constructor(
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || 'Guest User';
    this.email = localStorage.getItem('email') || 'Not available';
    this.role = this.authService.getRole() || 'USER';
    this.memberSince = localStorage.getItem('memberSince') || new Date().getFullYear().toString();

    this.reservationService.getMyReservations().subscribe({
      next: (res) => {
        const sortedReservations = this.sortRecentFirst(res);
        this.totalBookings = sortedReservations.length;
        const today = new Date();
        this.upcomingBookings = sortedReservations.filter(r => new Date(r.checkInDate) >= today).length;
        this.completedBookings = sortedReservations.filter(r => new Date(r.checkOutDate) < today).length;
        this.recentReservations = sortedReservations.slice(0, 5);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getInitials(): string {
    return this.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  }

  getRoomId(reservation: Reservation): number | undefined {
    return reservation.roomId ?? reservation.room?.roomId;
  }

  private sortRecentFirst(reservations: Reservation[]): Reservation[] {
    return [...reservations].sort((a, b) => {
      const bId = b.reservationId ?? 0;
      const aId = a.reservationId ?? 0;
      if (bId !== aId) {
        return bId - aId;
      }

      return new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime();
    });
  }
}
