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
