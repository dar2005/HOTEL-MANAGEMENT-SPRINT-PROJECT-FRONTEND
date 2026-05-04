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
      checkInDate: ['', [Validators.required]],
      checkOutDate: ['', [Validators.required]],
      paymentType: ['PAY_AT_HOTEL', Validators.required]
    });
  }

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
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
      },
      error: (err) => {
        this.toastr.error('Could not load room details');
        this.router.navigate(['/rooms']);
      }
    });
  }

  onSubmit() {
    if (this.checkoutForm.valid && this.room) {
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
        guestEmail: 'test@test.com', // mock email
        guestPhone: '1234567890',    // mock phone
        checkInDate: formValue.checkInDate,
        checkOutDate: formValue.checkOutDate,
        roomId: this.roomId,
        room: { roomId: this.roomId } as Room,
        totalPrice: this.totalPrice
      };

      // 1. Create Reservation
      this.reservationService.createReservation(reservation).subscribe({
        next: (res: any) => {
          // 2. Mock Payment Call using DTO assumptions
          const paymentDto = {
            reservationId: res.reservationId || res.id,
            amount: this.totalPrice,
            paymentMethod: formValue.paymentType
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
          this.toastr.error('Failed to create reservation', 'Error');
        }
      });
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }
}
