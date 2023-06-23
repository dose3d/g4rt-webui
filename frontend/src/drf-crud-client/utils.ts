/**
 * Build queryKey for caching by TanStack Query library.
 * Used by useEntity for cache retrieved entity
 * and useCreateUpdateDelete for invalidate or update
 * entity in cache after changes.
 * @param resource REST API resource
 * @param primaryKey key of resource
 */
export function getEntityQueryKey<PK extends number | string = number | string>(resource: string, primaryKey: PK) {
  return [resource, 'entity', `${primaryKey}`];
}

/**
 * Build endpoint for useQueryWrapper or useMutationWrapper.
 *
 * The endpoint schema:
 * {api}{resource}/
 *
 * or
 *
 * {api}{resource}/{primaryKey}/
 *
 * or
 *
 * {api}{resource}/{action}/
 *
 * or
 *
 * {api}{resource}/{primaryKey}/{action}/
 *
 * @param api prefix for REST API resource endpoint
 * @param resource endpoint of resource
 * @param primaryKey (optional) unique identifier of entity
 * @param action (optional) action for resource of single entity
 */
export function buildEndpoint<PK extends number | string = number | string>(
  api: string,
  resource: string,
  primaryKey?: PK,
  action?: string,
) {
  let endpoint = `${api}${resource}/`;

  if (primaryKey !== undefined) {
    endpoint = `${endpoint}${primaryKey}/`;
  }

  if (action !== undefined) {
    endpoint = `${endpoint}${action}/`;
  }

  return endpoint;
}

/**
 * Build queryKey for caching by TanStack Query library.
 *
 * When primaryKeyQK is not provided, uses schema for whole resource:
 * [resourceQK, 'list']
 *
 * Otherwise, uses schema for single entity:
 * [resourceQK, 'entity', primaryKeyQK]
 *
 * @param resourceQK part of queryKey identifies resource
 * @param primaryKeyQK (optional) part of queryKey identifies single entity
 */
export function buildQueryKey<PK extends number | string = number | string>(resourceQK: string, primaryKeyQK: PK) {
  if (primaryKeyQK === undefined) {
    return [resourceQK, 'list'];
  }

  return [resourceQK, 'entity', `${primaryKeyQK}`];
}
