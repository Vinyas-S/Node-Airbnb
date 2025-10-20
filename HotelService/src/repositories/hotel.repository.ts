import logger from '../config/logger.config';
import Hotel from '../db/models/hotel';
import { createHotelDTO } from '../dto/hotel.dto';
import { NotFoundError } from '../utils/error/app.error';

export async function createHotel(hotelData : createHotelDTO){
    const hotel = await Hotel.create({
        name : hotelData.name,
        address : hotelData.address,
        location : hotelData.location,
        rating : hotelData.rating ,
        rating_count : hotelData.rating_count
    });
    logger.info(`Hotel created with id: ${hotel.id}`);

    return hotel;
}

export async function getHotelById(hotelId : number){
    const hotel = await Hotel.findByPk(hotelId);
    if(!hotel){
        logger.warn(`Hotel not found with id: ${hotelId}`);
        throw new NotFoundError('Hotel not found');
    }
    return hotel;
}

export async function getAllHotels(){
    const hotels = await Hotel.findAll({
        where : { deletedAt : null }
    });

    if(!hotels){
        logger.warn('No hotels found');
        throw new NotFoundError('No hotels found');
    }
    logger.info(`Hotels found ${hotels.length}`);
    return hotels;
}

export async function softdeleteHotel(hotelId : number){
    const hotel = await Hotel.findByPk(hotelId);
    if(!hotel){
        logger.warn(`Hotel not found with id: ${hotelId}`);
        throw new NotFoundError('Hotel not found');
    }
    hotel.deletedAt = new Date();
    await hotel.save();
    logger.info(`Hotel soft deleted with id: ${hotelId}`);
    return true;
}