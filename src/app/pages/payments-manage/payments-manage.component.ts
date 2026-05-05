import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PaymentService } from '../../services/payment.service';
import { ReservationService } from '../../services/reservation.service';
import { Payment, Reservation } from '../../models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payments-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './payments-manage.component.html',
  styleUrl: './payments-manage.component.css'
})
export class PaymentsManageComponent implements OnInit {
  payments: Payment[] = [];
  reservations: Reservation[] = [];
  isLoading = false;
  searchTerm = '';
  filterStatus = 'all'; // 'all', 'pending', 'completed', 'failed'
  filterDateStart = '';
  filterDateEnd = '';
  totalRevenue = 0;
  pendingAmount = 0;

  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
    this.loadReservations();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getAllPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.calculateMetrics();
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load payments');
        this.isLoading = false;
      }
    });
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe({
      next: (data) => {
        this.reservations = data;
      },
      error: () => this.toastr.error('Failed to load reservations')
    });
  }

  calculateMetrics(): void {
    this.totalRevenue = this.payments
      .filter(p => p.paymentStatus === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);

    this.pendingAmount = this.payments
      .filter(p => p.paymentStatus === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  get filteredPayments(): Payment[] {
    let filtered = this.payments;

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(p =>
        (p.paymentStatus || 'PENDING').toUpperCase() === this.filterStatus.toUpperCase()
      );
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.reservationId.toString().includes(term) ||
        p.transactionId?.toLowerCase().includes(term)
      );
    }

    // Apply date range filter
    if (this.filterDateStart) {
      const startDate = new Date(this.filterDateStart);
      filtered = filtered.filter(p => new Date(p.paymentDate) >= startDate);
    }

    if (this.filterDateEnd) {
      const endDate = new Date(this.filterDateEnd);
      filtered = filtered.filter(p => new Date(p.paymentDate) <= endDate);
    }

    return filtered;
  }

  updatePaymentStatus(paymentId: number, newStatus: string): void {
    this.paymentService.updatePaymentStatus(paymentId, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Payment status updated to ${newStatus}`);
        this.loadPayments();
      },
      error: () => this.toastr.error('Failed to update payment status')
    });
  }

  confirmPayment(paymentId: number): void {
    this.updatePaymentStatus(paymentId, 'COMPLETED');
  }

  markAsFailed(paymentId: number): void {
    this.updatePaymentStatus(paymentId, 'FAILED');
  }

  getReservationGuest(reservationId: number): string {
    const reservation = this.reservations.find(r => r.reservationId === reservationId);
    return reservation ? reservation.guestName : 'Unknown';
  }

  getStatusBadgeClass(status?: string): string {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'COMPLETED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'FAILED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.filterDateStart = '';
    this.filterDateEnd = '';
  }

  exportPayments(): void {
    const csv = this.convertToCSV(this.filteredPayments);
    this.downloadCSV(csv, 'payments.csv');
    this.toastr.success('Payments exported successfully');
  }

  private convertToCSV(data: Payment[]): string {
    const headers = ['Payment ID', 'Reservation ID', 'Guest', 'Amount', 'Status', 'Payment Date', 'Method', 'Transaction ID'];
    const rows = data.map(p => [
      p.paymentId,
      p.reservationId,
      this.getReservationGuest(p.reservationId),
      p.amount,
      p.paymentStatus,
      new Date(p.paymentDate).toLocaleDateString(),
      p.paymentMethod || 'N/A',
      p.transactionId || 'N/A'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    return csv;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
