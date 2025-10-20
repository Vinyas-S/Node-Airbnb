export interface AppError extends Error {
    statusCode: number;
}

export class InternalServerError implements AppError {
    message: string
    statusCode: number
    name: string
   constructor(message: string){
        this.statusCode = 500,
        this.message = message,
        this.name = "InternalServerError"
   }

}

export class NotFoundError implements AppError {
    message: string
    statusCode: number
    name: string
    constructor(message: string){
        this.statusCode = 404,
        this.message = message,
        this.name = "NotFoundError"
    }
}