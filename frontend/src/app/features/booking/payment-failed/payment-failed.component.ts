import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-failed.component.html',
  styleUrl: './payment-failed.component.scss',
})
export class PaymentFailedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);

  reservationId = '';
  isRetrying = false;
  errorMessage = '';

  ngOnInit(): void {
    this.reservationId = this.route.snapshot.queryParams['reservation_id'] || '';
  }

  // retry checkout if reservation is still pending
  retryPayment(): void {
    if (!this.reservationId) {
      return;
    }

    this.isRetrying = true;
    this.errorMessage = '';

    this.paymentService.createCheckoutSession(this.reservationId).subscribe({
      next: (res) => {
        this.isRetrying = false;
        window.location.href = res.checkout_url;
      },
      error: (err) => {
        this.isRetrying = false;
        this.errorMessage = err.error?.error || 'Could not start payment again.';
      },
    });
  }
}
