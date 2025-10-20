import { CreateBookingDto } from "../dtos/booking.dto";
import {createBooking, createIdempotencyKey, getIdempotencyKey, confirmBooking, finalizeIdempotencyKey} from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/error/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";

export async function createBookingService(createBookingDto: CreateBookingDto){
    const booking = await createBooking({
        userId: createBookingDto.userId, 
        hotelId: createBookingDto.hotelId, 
        bookingAmount: createBookingDto.bookingAmount
    });
    
    const idempotencyKey = generateIdempotencyKey();

    await createIdempotencyKey(idempotencyKey,booking.id);
    return {
        bookingId : booking.id, 
        idempotencyKey: idempotencyKey
    };


}

export async function confirmBookingService(idempotencyKey: string){
    const idempotencyKeyData = await getIdempotencyKey(idempotencyKey);
    if(!idempotencyKeyData){
        throw new NotFoundError("Idempotency Key not found");
    }
    if(idempotencyKeyData.finalized){
        throw new BadRequestError("Booking already finalized for this idempotency key");
    }
    const bookingId = idempotencyKeyData.bookingId;
    if (bookingId == null) throw new BadRequestError("Booking ID missing");
    const booking  = await confirmBooking(bookingId);
    await finalizeIdempotencyKey(idempotencyKey);
    return booking;
}