import { NotFoundError } from "#errors";
import { findLastCheckpoint, upsertCheckpoint } from '../repository/score.repository.js';

export async function getLastCheckpoint(roomId) {
    const checkpoint = await findLastCheckpoint(roomId);

    if (!checkpoint) {
        throw new NotFoundError('No checkpoint found for this room');
    }

    return checkpoint;
}

export async function saveCheckpoint(data) {
    return upsertCheckpoint(data);
}
