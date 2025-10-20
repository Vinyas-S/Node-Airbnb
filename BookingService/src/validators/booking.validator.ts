import {z} from "zod";

export const createBookingSchema = z.object({
    userId: z.number({message: "User ID must be present"}),
    hotelId: z.number({message: "Hotel ID must be present"}),
    bookingAmount: z.number().min(1, {message: "Booking amount must be at least 1"})
});