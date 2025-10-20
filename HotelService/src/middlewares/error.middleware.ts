import { NextFunction, Request, Response } from "express";
import { AppError, NotFoundError } from "../utils/error/app.error";

export const appErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {

    console.log(err);

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}

export const notFoundHandler = (req: NotFoundError, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: "Not Found"
    });
}