import { Prisma, IdempotencyKey } from "@prisma/client";

import {validate as isValidUUID} from "uuid"

import prismaClient from "../prisma/client"
import { InternalServerError, NotFoundError } from "../utils/error/app.error";

export async function createBooking(bookingInput: Prisma.BookingCreateInput) {
    const booking = prismaClient.booking.create({
        data : bookingInput
    })
    return booking;
}

export async function createIdempotencyKey(idemKey: string, bookingId?: number){
    const idempotencyKey = await prismaClient.idempotencyKey.create({
        data: {
            idemKey,
            booking:{
                connect:{
                    id: bookingId
                }
            }
        }
    })
    return idempotencyKey;
}

export async function getIdempotencyKeyWithLock(tx: Prisma.TransactionClient,key: string){

    if(!isValidUUID(key)){
        throw new InternalServerError("Invalid Idempotency Key format");
    }
    const idempotencyKey: Array<IdempotencyKey> = await tx.$queryRaw(
        Prisma.raw(`SELECT * FROM IdempotencyKey WHERE idemKey = '${key}' FOR UPDATE;`)
    )

    console.log("Idempotency Key with lock fetched:", idempotencyKey);

    if(!idempotencyKey ||idempotencyKey.length === 0){
        throw new NotFoundError("Idempotency Key not found");
    }
    
    return idempotencyKey[0];
}

export async function getBookingById(bookingId: number){
    const booking = await prismaClient.booking.findUnique({
        where:{
            id: bookingId
        }
    })
    return booking;
}

export async function confirmBooking( tx: Prisma.TransactionClient, bookingId: number,){
    const booking = await tx.booking.update({
        where:{
            id: bookingId,
        },
        data:{
            status: 'CONFIRMED'
        }
    })
    return booking;
}

export async function cancelBooking(bookingId: number){
    const booking = await prismaClient.booking.update({
        where:{
            id: bookingId,
        },
        data:{
            status: 'CANCELLED'
        }
    })
    return booking;
}




export async function finalizeIdempotencyKey(tx: Prisma.TransactionClient, idemKey: string){
    const idempotencyKey = await tx.idempotencyKey.update({
        where:{
            idemKey,
        },
        data:{
            finalized: true
        }
    })
    return idempotencyKey;
}