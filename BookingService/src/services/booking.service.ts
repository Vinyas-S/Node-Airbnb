import { CreateBookingDto } from "../dtos/booking.dto";
import {createBooking, createIdempotencyKey, getIdempotencyKeyWithLock, confirmBooking, finalizeIdempotencyKey} from "../repositories/booking.repository";
import { BadRequestError, NotFoundError } from "../utils/error/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";

import prismaClient from "../prisma/client";

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

    return await prismaClient.$transaction(async (tx) => {
        const idempotencyKeyData = await getIdempotencyKeyWithLock(tx, idempotencyKey);
        if(!idempotencyKeyData || !idempotencyKeyData.bookingId){
            throw new NotFoundError("Idempotency Key not found");
        }
        if(idempotencyKeyData.finalized){
            throw new BadRequestError("Booking already finalized for this idempotency key");
        }
        const bookingId = idempotencyKeyData.bookingId;
        if (bookingId == null) throw new BadRequestError("Booking ID missing");

        const booking  = await confirmBooking(tx, bookingId);
        await finalizeIdempotencyKey(tx, idempotencyKey);

        return booking;
    })
}