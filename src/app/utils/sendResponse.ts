import { Response } from "express"

interface TMeta {
    total: number,
    page: number,
    limit: number,
    totalPage: number
}

interface TResponse<T> {
    statusCode: number,
    success: boolean,
    message: string,
    data: T,
    meta?: TMeta
}

export const sendResponse = <T>(res: Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        meta: data.meta,
        data: data.data,
        message: data.message
    })
}