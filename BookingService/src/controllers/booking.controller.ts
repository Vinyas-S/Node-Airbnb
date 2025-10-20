import { Request, Response } from "express";
import { confirmBookingService, createBookingService } from "../services/booking.service";

export async function createBookingHandler(req: Request, res: Response) {
    // Implementation for creating a booking
    console.log("Creating booking with data:", req.body);
    const booking = await createBookingService(req.body);
    console.log("Booking created:", booking);
    res.status(201).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey
    });
}


export const confirmBookingHandler = async (req: Request, res: Response) => {
    const booking = await confirmBookingService(req.params.idempotencyKey);
    res.status(200).json({
        bookingId: booking.id,
        status: booking.status,
    });
}