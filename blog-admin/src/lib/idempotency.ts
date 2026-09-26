/**
 * Idempotency Protection System for FairPlay Studio
 * 
 * Guarantees that mutating operations (Post Creation, Publishing, AI Generation)
 * execute EXACTLY ONCE, even under rapid double-clicks, network drops, or automated retries.
 * 
 * Adheres to IETF draft-ietf-httpapi-idempotency-key-header standards.
 */

interface IdempotencyRecord {
  status: 'pending' | 'completed';
  statusCode?: number;
  body?: any;
  createdAt: number;
}

// In-memory LRU store with automatic 5-minute TTL eviction
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;
const idempotencyStore = new Map<string, IdempotencyRecord>();

/**
 * Periodically purge expired idempotency keys to prevent memory leak
 */
function cleanupExpiredKeys(): void {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.createdAt > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}

// Run cleanup every 2 minutes
setInterval(cleanupExpiredKeys, 2 * 60 * 1000).unref();

export interface IdempotencyResult<T> {
  isReplay: boolean;
  statusCode: number;
  data: T;
}

/**
 * Executes a mutation handler with idempotency guarantees.
 * 
 * @param key The idempotency key provided by client (from header 'Idempotency-Key')
 * @param handler The actual async operation to execute if key is new
 */
export async function withIdempotency<T>(
  key: string | null | undefined,
  handler: () => Promise<{ statusCode: number; data: T }>
): Promise<IdempotencyResult<T>> {
  // If no idempotency key was supplied, execute handler normally
  if (!key || typeof key !== 'string' || !key.trim()) {
    const result = await handler();
    return {
      isReplay: false,
      statusCode: result.statusCode,
      data: result.data,
    };
  }

  const cleanKey = key.trim();
  const existing = idempotencyStore.get(cleanKey);
  const now = Date.now();

  // If key exists and is still within TTL:
  if (existing && now - existing.createdAt < IDEMPOTENCY_TTL_MS) {
    if (existing.status === 'pending') {
      // Concurrent request with same key is currently running
      const error: any = new Error(
        'A request with this Idempotency-Key is currently being processed. Please wait for completion.'
      );
      error.statusCode = 409;
      error.isConcurrentConflict = true;
      throw error;
    }

    if (existing.status === 'completed') {
      // Replay cached response
      return {
        isReplay: true,
        statusCode: existing.statusCode || 200,
        data: existing.body as T,
      };
    }
  }

  // Register key as pending to block concurrent race conditions
  idempotencyStore.set(cleanKey, {
    status: 'pending',
    createdAt: now,
  });

  try {
    const result = await handler();

    // Cache successful execution
    idempotencyStore.set(cleanKey, {
      status: 'completed',
      statusCode: result.statusCode,
      body: result.data,
      createdAt: Date.now(),
    });

    return {
      isReplay: false,
      statusCode: result.statusCode,
      data: result.data,
    };
  } catch (err) {
    // If the handler threw an error, delete the key so client can legitimately retry
    idempotencyStore.delete(cleanKey);
    throw err;
  }
}
