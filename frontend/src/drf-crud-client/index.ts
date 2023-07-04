/**
 * Django Rest Framework client library with SimpleJWT authentication.
 *
 * Stack:
 * - Axios - for web communication with JWT auth token (Bearer token),
 * - TanStack Query - for handle fetching, caching, synchronizing and updating server state,
 * - React Forms Hook - parse backend validation errors from DRF and insert to RFH validation errors.
 * - i18next - translate frontend error messages.
 *
 * The layers of library for fetching data:
 *
 * 1st layer: making RAW requests via axios with auth data injection
 *   - useQueryWrapper - GET requests
 *   - useMutationWrapper - POST (default), PUT, DELETE requests
 *
 * Auth data is injected from AuthProvider context provider.
 * AuthProvider uses object of class AuthManager that implements methods
 * for auth data injection to HTTP requests, load and store auth data in
 * client's storage (i.e. localStorage or sessionStorage) and handle auth
 * errors (i.e. session expiration in backend).
 *
 * By default, AuthProvider uses SimpleJwtAuthManager that implements these
 * methods to work with SimpleJWT python's module.
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
 * The frontend errors (i.e. connection error) are translate by i18next.
 * Errors from backend are passed to react-form-hooks directly as validation
 * error of fields.
 */

import { DrfI18nResourceEn } from './i18n_en';
import { DrfError, formatErrorToString, loadErrorsToRFH, useFormatErrorToString } from './errors';
import { useSimpleJwtForm } from './useSimpleJwtForm';
import { useQueryWrapper } from './useQueryWrapper';
import { getEntityQueryKey } from './utils';
import { useDrfEntity } from './useDrfEntity';
import { PaginationController, useDrfPaginatedControlled } from './useDrfPaginatedControlled';
import { useDrfPaginated } from './useDrfPaginated';
import { usePagesController } from './usePagesController';
import { useMutationWrapper } from './useMutationWrapper';
import { useDrfCUD, UseDrfCUD } from './useDrfCUD';
import { useDrfDelete } from './useDrfDelete';
import { useDrfForm } from './useDrfForm';
import { useDrfEntityForm, UseDrfEntityForm } from './useDrfEntityForm';
import { useDrfList } from './useDrfList';
import { AuthContext, AuthProvider } from './AuthContext';
import { useAuthContext } from './useAuthContext';
import { AuthManager } from './AuthManager';
import { decodeJwtOrNull, SimpleJwtAuthManager } from './SimpleJwtAuthManager';

export type { DrfError, PaginationController, UseDrfCUD, UseDrfEntityForm };
export {
  DrfI18nResourceEn,
  formatErrorToString,
  loadErrorsToRFH,
  useFormatErrorToString,
  useSimpleJwtForm,
  useQueryWrapper,
  getEntityQueryKey,
  useDrfEntity,
  useDrfList,
  useDrfPaginated,
  usePagesController,
  useDrfPaginatedControlled,
  useMutationWrapper,
  useDrfCUD,
  useDrfDelete,
  useDrfForm,
  useDrfEntityForm,
  AuthProvider,
  AuthContext,
  useAuthContext,
  AuthManager,
  SimpleJwtAuthManager,
  decodeJwtOrNull,
};
