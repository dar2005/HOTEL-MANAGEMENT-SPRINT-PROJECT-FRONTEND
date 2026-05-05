import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/models';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.css'
})
export class ReservationDetailComponent implements OnInit {
  reservation: Reservation | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Invalid reservation ID.';
      this.isLoading = false;
      return;
    }

    this.reservationService.getMyReservationById(id).subscribe({
      next: (res) => {
        this.reservation = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load reservation', err);
        this.errorMessage = 'Could not load reservation details.';
        this.isLoading = false;
      }
    });
  }

}
