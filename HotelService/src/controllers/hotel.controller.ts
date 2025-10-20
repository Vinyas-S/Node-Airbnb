import { Request, Response, NextFunction } from "express";
import { createHotelService, deleteHotelService, getAllHotelsService, getHotelByIdService } from "../services/hotel.service";

export async function createHotelHandler(req: Request, res: Response, next : NextFunction){
    const hotelResponse = await createHotelService(req.body);
    res.status(201).json({
        message : "Hotel created successfully",
        data : hotelResponse,
        suceess : true
    })
}

export async function getHotelByIdHandler(req: Request, res: Response, next : NextFunction){
    const hotelResponse = await getHotelByIdService(Number(req.params.id));
    res.status(200).json({
        message : "Hotel found successfully",
        data : hotelResponse,
        suceess : true
    })
}

export async function getAllHotelsHandler(req: Request, res: Response, next : NextFunction){
    const hotelResponse = await getAllHotelsService();
    res.status(200).json({
        message : "Hotels found successfully",
        data : hotelResponse,
        suceess : true
    })
}

export async function deleteHotelHandler(req: Request, res: Response, next : NextFunction){
    const hotelResponse = await deleteHotelService(Number(req.params.id));
    res.status(200).json({
        message : "Hotel deleted successfully",
        data : hotelResponse,
        suceess : true
    })
}