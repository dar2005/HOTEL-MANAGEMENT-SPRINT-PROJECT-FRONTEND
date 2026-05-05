import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { HttpClient } from '@angular/common/http';
import { Room, Reservation } from '../../models/models';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  roomId!: number;
  room: Room | null = null;
  checkoutForm: FormGroup;
  isLoading = false;
  totalPrice = 0;
  nights = 1;
  minDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    this.checkoutForm = this.fb.group({
      guestName: ['', Validators.required],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      checkInDate: ['', [Validators.required]],
      checkOutDate: ['', [Validators.required]],
      paymentType: ['PAY_AT_HOTEL', Validators.required]
    });
  }

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
    this.prefillUserDetails();
    this.fetchRoomDetails();

    // Calculate price dynamically
    this.checkoutForm.valueChanges.subscribe(val => {
      if (val.checkInDate && val.checkOutDate && this.room) {
        const start = new Date(val.checkInDate);
        const end = new Date(val.checkOutDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        this.nights = diffDays > 0 ? diffDays : 1;
        this.totalPrice = this.nights * (this.room.roomType?.pricePerNight || 0);
      }
    });
  }

  fetchRoomDetails() {
    this.roomService.getById(this.roomId).subscribe({
      next: (res) => {
        this.room = res;
        this.totalPrice = res.roomType?.pricePerNight || 0; // default 1 night
        if (!res.isAvailable) {
          this.toastr.warning('This room is no longer available. Please choose another room.', 'Room unavailable');
        }
      },
      error: (err) => {
        this.toastr.error('Could not load room details');
        this.router.navigate(['/rooms']);
      }
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid && this.room) {
      if (!this.room.isAvailable) {
        this.toastr.error('This room is already booked. Please choose an available room.', 'Room unavailable');
        return;
      }

      this.isLoading = true;
      const formValue = this.checkoutForm.value;

      if (formValue.checkInDate < this.minDate) {
        this.toastr.error('Check-in date cannot be in the past');
        this.isLoading = false;
        return;
      }
      if (formValue.checkOutDate <= formValue.checkInDate) {
        this.toastr.error('Check-out date must be after check-in date');
        this.isLoading = false;
        return;
      }

      const reservation: Reservation = {
        guestName: formValue.guestName,
        guestEmail: localStorage.getItem('email') || formValue.guestEmail,
        guestPhone: formValue.guestPhone,
        checkInDate: formValue.checkInDate,
        checkOutDate: formValue.checkOutDate,
        room: { roomId: this.roomId } as Room
      };

      // 1. Create Reservation
      this.reservationService.createReservation(reservation).subscribe({
        next: (res: any) => {
          // 2. Mock Payment Call using DTO assumptions
          const paymentDto = {
            reservationId: res.reservationId || res.id,
            amount: this.totalPrice,
            paymentDate: new Date().toISOString().split('T')[0],
            paymentStatus: formValue.paymentType === 'ONLINE' ? 'SUCCESS' : 'PENDING'
          };
          
          this.http.post(`${environment.apiUrl}/api/payments`, paymentDto).subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success('Booking confirmed successfully!');
              this.router.navigate(['/dashboard']);
            },
            error: (err) => {
              this.isLoading = false;
              // Even if mock payment fails, reservation might be created
              this.toastr.warning('Reservation created, but payment processing failed.', 'Warning');
              this.router.navigate(['/dashboard']);
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          const message = this.getErrorMessage(err) || 'Failed to create reservation';
          this.toastr.error(message, 'Error');
        }
      });
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

  private getErrorMessage(err: any): string | null {
    if (typeof err?.error === 'string') {
      return err.error;
    }

    return err?.error?.message || err?.message || null;
  }

  private prefillUserDetails(): void {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    this.checkoutForm.patchValue({
      guestName: username || '',
      guestEmail: email || ''
    });
  }
}
