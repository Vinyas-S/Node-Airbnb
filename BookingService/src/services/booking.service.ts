import { CreateBookingDto } from "../dtos/booking.dto";
import {createBooking, createIdempotencyKey, getIdempotencyKeyWithLock, confirmBooking, finalizeIdempotencyKey} from "../repositories/booking.repository";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils/error/app.error";
import { generateIdempotencyKey } from "../utils/generateIdempotencyKey";

import prismaClient from "../prisma/client";
import { redLock } from "../config/redis.config";
import { serverConfig } from "../config";

export async function createBookingService(createBookingDto: CreateBookingDto){

    const ttl = serverConfig.LOCK_TTL;
    const bookingResource = `hotel:${createBookingDto.hotelId}`;

    try{
        console.log("Attempting to acquire lock for booking resource:", bookingResource);
        await redLock.acquire([bookingResource], ttl);
        console.log("Lock acquired for booking resource:", bookingResource);
        const booking = await createBooking({
            userId: createBookingDto.userId, 
            hotelId: createBookingDto.hotelId, 
            bookingAmount: createBookingDto.bookingAmount
        });
        console.log("Booking created with ID:", booking.id);
        const idempotencyKey = generateIdempotencyKey();
        console.log("Generated Idempotency Key:", idempotencyKey);
        await createIdempotencyKey(idempotencyKey,booking.id);
        return {
            bookingId : booking.id, 
            idempotencyKey: idempotencyKey
        };
    } catch(err){
        throw new InternalServerError("Failed to acquire lock for booking resource");        
    }
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
    });
}