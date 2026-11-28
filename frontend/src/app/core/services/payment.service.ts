import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation } from '../models/reservation.model';

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
  payment_id: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // create stripe checkout session for a pending reservation
  createCheckoutSession(reservationId: string): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/payments/checkout-session`,
      { reservation_id: reservationId }
    );
  }

  // get reservation status from backend to verify webhook confirmation
  getReservationStatus(reservationId: string): Observable<{ reservation: Reservation }> {
    return this.http.get<{ reservation: Reservation }>(
      `${this.apiUrl}/reservations/${reservationId}`
    );
  }
}
