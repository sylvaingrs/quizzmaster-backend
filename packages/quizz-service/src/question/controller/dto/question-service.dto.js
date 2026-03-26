const questionProperties = {
    id:            { type: 'integer' },
    quizId:        { type: 'integer' },
    title:         { type: 'string' },
    options:       { type: 'array', items: { type: 'string' } },
    correctAnswer: { type: 'array', items: { type: 'string' } },
    timeLimit:     { type: 'integer' },
};

const questionResponse = {
    type: 'object',
    properties: questionProperties,
};

const errorResponse = {
    type: 'object',
    properties: {
        message: { type: 'string' },
    }
};

const commonErrors = {
    404: errorResponse,
    500: errorResponse,
};

const parentParams = {
    type: 'object',
    required: ['quizzId'],
    properties: {
        quizzId: { type: 'integer' },
    }
};

const parentAndIdParams = {
    type: 'object',
    required: ['quizzId', 'id'],
    properties: {
        quizzId: { type: 'integer' },
        id: { type: 'integer' },
    }
}

export const getAllQuestionsSchema = {
    tags: ['Question'],
    params: parentParams,
    response: {
        200: {
            type: 'array',
            items: questionResponse,
        }
    },
};

export const getQuestionSchema = {
    tags: ['Question'],
    params: parentAndIdParams,
    response: {
        200: questionResponse,
        ...commonErrors,
    }
};

export const createQuestionSchema = {
    tags: ['Question'],
    operationId: 'createQuestion',
    params: parentParams,
    body: {
        type: 'object',
        required: ['title', 'options', 'correctAnswer'],
        properties: {
            title:         { type: 'string' },
            options:       { type: 'array', items: { type: 'string' }, minItems: 2 },
            correctAnswer: { type: 'array', items: { type: 'string' }, minItems: 1 },
            timeLimit:     { type: 'integer', default: 30 },
        },
        additionalProperties: false,
    },
    response: {
        201: questionResponse,
        ...commonErrors,
    },
};

export const updateQuestionSchema = {
    tags: ['Question'],
    params: parentAndIdParams,
    body: {
        type: 'object',
        properties: {
            title:         { type: 'string' },
            options:       { type: 'array', items: { type: 'string' }, minItems: 2 },
            correctAnswer: { type: 'array', items: { type: 'string' }, minItems: 1 },
            timeLimit:     { type: 'integer' },
        },
        additionalProperties: false,
        minProperties: 1,
    },
    response: {
        200: questionResponse,
        ...commonErrors,
    },
};

export const deleteQuestionSchema = {
    tags: ['Question'],
    params: parentAndIdParams,
    response: {
        204: { type: 'null' },
        ...commonErrors,
    },
};