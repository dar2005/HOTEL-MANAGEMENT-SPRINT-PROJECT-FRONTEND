import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { ReservationService } from '../../services/reservation.service';
import { Reservation } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  reservations: Reservation[] = [];
  isLoading = true;
  username: string | null = null;
  email: string | null = null;
  reviewReservation: Reservation | null = null;
  reviewRating = 5;
  reviewComment = '';
  isSubmittingReview = false;
  reviewMessage = '';
  reviewError = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.email = localStorage.getItem('email');
    this.fetchMyBookings();
  }

  fetchMyBookings() {
    this.reservationService.getMyReservations().subscribe({
      next: (res) => {
        this.reservations = this.sortRecentFirst(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch bookings', err);
        this.isLoading = false;
      }
    });
  }

  goToDetails(reservation: Reservation): void {
    const reservationId = reservation.reservationId ?? (reservation as any).id;
    if (!reservationId) {
      return;
    }
    this.router.navigate(['/dashboard/reservation', reservationId]);
  }

  getTotalPaid(reservation: Reservation): string {
    const paid = reservation.totalPrice ?? (reservation as any).total_price ?? 0;
    return `$${paid}`;
  }

  getRoomId(reservation: Reservation): number | undefined {
    return reservation.roomId ?? reservation.room?.roomId;
  }

  openReviewForm(reservation: Reservation): void {
    this.reviewReservation = reservation;
    this.reviewRating = 5;
    this.reviewComment = '';
    this.reviewMessage = '';
    this.reviewError = '';
  }

  cancelReview(): void {
    this.reviewReservation = null;
    this.reviewComment = '';
    this.reviewError = '';
  }

  submitReview(): void {
    if (!this.reviewReservation?.reservationId) {
      return;
    }

    if (!this.reviewComment.trim()) {
      this.reviewError = 'Comment is required.';
      return;
    }

    this.isSubmittingReview = true;
    this.reviewError = '';

    this.reviewService.createReview({
      reservationId: this.reviewReservation.reservationId,
      rating: Number(this.reviewRating),
      comment: this.reviewComment.trim()
    }).subscribe({
      next: () => {
        this.isSubmittingReview = false;
        this.reviewMessage = 'Review submitted successfully.';
        this.cancelReview();
      },
      error: (err) => {
        console.error('Failed to submit review', err);
        this.isSubmittingReview = false;
        this.reviewError = this.getErrorMessage(err) || 'Could not submit review.';
      }
    });
  }

  private getErrorMessage(err: any): string | null {
    if (typeof err?.error === 'string') return err.error;
    return err?.error?.message || err?.message || null;
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
