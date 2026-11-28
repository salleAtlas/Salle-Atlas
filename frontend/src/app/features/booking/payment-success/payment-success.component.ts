import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { Reservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss',
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  reservationId = '';
  reservation: Reservation | null = null;
  isLoading = true;
  errorMessage = '';
  private retryCount = 0;
  private retryTimer: any = null;

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.queryParams['reservation_id'] || '';
    if (!this.reservationId) {
      this.isLoading = false;
      this.errorMessage = 'Missing reservation id.';
      return;
    }

    this.checkStatus();
  }

  ngOnDestroy(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  // verify reservation status via api (webhook confirms it)
  checkStatus(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getReservationStatus(this.reservationId).subscribe({
      next: (res) => {
        this.reservation = res.reservation;
        if (this.reservation.status === 'PENDING' && this.retryCount < 3) {
          this.retryCount++;
          this.retryTimer = setTimeout(() => this.checkStatus(), 2000);
          return;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Could not verify reservation status.';
      },
    });
  }
}
