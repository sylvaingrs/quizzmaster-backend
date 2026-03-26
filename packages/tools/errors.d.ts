export declare class RoomError extends Error {
    status: number;
    constructor(message: string, status: number);
}

export declare class NotFoundError extends RoomError {
    constructor(message: string);
}

export declare class BadRequestError extends RoomError {
    constructor(message: string);
}

export declare class ForbiddenError extends RoomError {
    constructor(message: string);
}