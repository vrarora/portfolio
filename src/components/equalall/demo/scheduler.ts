/** Playback budget for embedded demos: at most two run at once. Others wait
 * frozen at their hero pose until a slot frees up. */
const MAX_CONCURRENT = 2;

const active = new Set<string>();
const queue: Array<{ id: string; grant: () => void }> = [];

export function acquireSlot(id: string, grant: () => void): () => void {
  if (active.size < MAX_CONCURRENT) {
    active.add(id);
    grant();
  } else {
    queue.push({ id, grant });
  }

  return function release() {
    const queued = queue.findIndex((entry) => entry.id === id);
    if (queued !== -1) {
      queue.splice(queued, 1);
      return;
    }
    if (!active.delete(id)) return;
    const next = queue.shift();
    if (next) {
      active.add(next.id);
      next.grant();
    }
  };
}
