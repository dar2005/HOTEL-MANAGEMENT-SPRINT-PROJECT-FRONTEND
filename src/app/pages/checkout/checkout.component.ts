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

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
      guest_name: ['', Validators.required],
      check_in_date: ['', Validators.required],
      check_out_date: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      expiry: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3}$')]]
    });
  }

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
    this.fetchRoomDetails();

    // Calculate price dynamically
    this.checkoutForm.valueChanges.subscribe(val => {
      if (val.check_in_date && val.check_out_date && this.room) {
        const start = new Date(val.check_in_date);
        const end = new Date(val.check_out_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        this.nights = diffDays > 0 ? diffDays : 1;
        this.totalPrice = this.nights * (this.room.roomType?.price_per_night || 0);
      }
    });
  }

  fetchRoomDetails() {
    this.roomService.getById(this.roomId).subscribe({
      next: (res) => {
        this.room = res;
        this.totalPrice = res.roomType?.price_per_night || 0; // default 1 night
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

      const reservation: Reservation = {
        guest_name: formValue.guest_name,
        guest_email: 'test@test.com', // mock email
        guest_phone: '1234567890',    // mock phone
        check_in_date: formValue.check_in_date,
        check_out_date: formValue.check_out_date,
        room_id: this.roomId,
        total_price: this.totalPrice
      };

      // 1. Create Reservation
      this.reservationService.createReservation(reservation).subscribe({
        next: (res: any) => {
          // 2. Mock Payment Call using DTO assumptions
          const paymentDto = {
            reservationId: res.reservation_id || res.id,
            amount: this.totalPrice,
            paymentMethod: 'CREDIT_CARD'
          };
          
          this.http.post(`${environment.apiUrl}/api/payments`, paymentDto).subscribe({
            next: () => {
              this.isLoading = false;
              this.toastr.success('Booking confirmed successfully!');
              this.router.navigate(['/confirmation']);
            },
            error: (err) => {
              this.isLoading = false;
              // Even if mock payment fails, reservation might be created
              this.toastr.warning('Reservation created, but payment processing failed.', 'Warning');
              this.router.navigate(['/confirmation']);
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
