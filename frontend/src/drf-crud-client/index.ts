/**
 * Django Rest Framework client library with SimpleJWT authentication.
 *
 * Stack:
 * - Axios - for web communication with JWT auth token (Bearer token),
 * - TanStack Query - for handle fetching, caching, synchronizing and updating server state,
 * - React Forms Hook - parse backend validation errors from DRF and insert to RFH validation errors.
 *
 * If you want to use SimpleJWT authentication please wrap by JwtAuthProvider.
 * Otherwise, please implement your own axiosInstance with your own interceptors.
 *
 * The layers of library for fetching data without mutation:
 *
 * 1st layer: making RAW requests via axios with auth data injection
 *   - useQueryWrapper - GET requests
 *   - useMutationWrapper - POST (default), PUT, DELETE requests
 *
 * 2nd layer: making CRUD operations to Django Rest Framework (DRF) resources
 *   - useDrfEntity - fetch entity by primary key and caching
 *   - useDrfList - fetch list of entities and caching
 *   - useDrfPaginated - fetch page of paginated resource and caching
 *   - useDrfCUD - modify entity and update/invalidate cache
 *   - useDrfDelete - remove entity and invalidate cache
 *
 * 3rd layer: passing backend validation errors to react-form-hooks errors
 *   - useDrfForm - RAW form and load validation errors from response
 *   - useDrfEntityForm - join useDrfForm and useDrfCUD functionality
 *
 */

import { DrfI18nResourceEn } from './i18n_en';
import { DrfError, formatErrorToString, loadErrorsToRFH, useFormatErrorToString } from './errors';
import { UseFormCreateUpdate, useFormCreateUpdate } from './useFormCreateUpdate';
import { useRFHIntegration } from './useRFHIntegration';
import { useCreateUpdateDelete } from './useCreateUpdateDelete';
import { useSimpleJwtClient } from './useSimpleJwtClient';
import { JwtAuthContext, JwtAuthProvider } from './JwtAuthContext';
import { useSimpleJwtForm } from './useSimpleJwtForm';
import { useSimpleJwtAxios } from './useSimpleJwtAxios';
import { useQueryWrapper } from './useQueryWrapper';
import { getEntityQueryKey } from './utils';
import { useDrfEntity } from './useDrfEntity';
import { PaginationController, useDrfPaginatedControlled } from './useDrfPaginatedControlled';
import { useDrfPaginated } from './useDrfPaginated';
import { usePagesController } from './usePagesController';
import { useMutationWrapper } from './useMutationWrapper';
import { useDrfCUD } from './useDrfCUD';
import { useDrfDelete } from './useDrfDelete';
import { useDrfForm } from './useDrfForm';

export type { DrfError, UseFormCreateUpdate, PaginationController };
export {
  DrfI18nResourceEn,
  formatErrorToString,
  loadErrorsToRFH,
  useFormatErrorToString,
  useRFHIntegration,
  useFormCreateUpdate,
  useCreateUpdateDelete,
  useSimpleJwtClient,
  JwtAuthProvider,
  JwtAuthContext,
  useSimpleJwtForm,
  useSimpleJwtAxios,
  useQueryWrapper,
  getEntityQueryKey,
  useDrfEntity,
  useDrfPaginated,
  usePagesController,
  useDrfPaginatedControlled,
  useMutationWrapper,
  useDrfCUD,
  useDrfDelete,
  useDrfForm,
};
