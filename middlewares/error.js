import { ErrorHandler } from "../utils/errorHandler.js";
export const errorMiddleware = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error"
    if(err.name === "CastError"){
        const message = "wrong data entry";
        err = new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message, 
        name: err.name
    })
}