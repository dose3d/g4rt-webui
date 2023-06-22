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
 * 1. useQueryWrapper - join Axios and TanStack Query,
 *    - uses useSimpleJwtAxios by default,
 *    - provide lastError, cleared after response with success instead new fetching.
 *    (I'm don't known why TanStack Query not handle it)
 *    Please use for any queries for backend for authenticated users.
 * 2.
 */

import { DrfI18nResourceEn } from './i18n_en';
import { PaginationController } from './usePaginationController';
import { DrfError, formatErrorToString, loadErrorsToRFH, useFormatErrorToString } from './errors';
import { useEntity } from './useEntity';
import { usePaginated } from './usePaginated';
import { UseFormCreateUpdate, useFormCreateUpdate } from './useFormCreateUpdate';
import { useRFHIntegration } from './useRFHIntegration';
import { useCreateUpdateDelete } from './useCreateUpdateDelete';
import { useSimpleJwtClient } from './useSimpleJwtClient';
import { JwtAuthContext, JwtAuthProvider } from './JwtAuthContext';
import { useSimpleJwtForm } from './useSimpleJwtForm';
import { useSimpleJwtAxios } from './useSimpleJwtAxios';
import { useQueryWrapper } from './useQueryWrapper';
import { getEntityQueryKey } from './utils';

export type { DrfError, PaginationController, UseFormCreateUpdate };
export {
  DrfI18nResourceEn,
  formatErrorToString,
  loadErrorsToRFH,
  useFormatErrorToString,
  useEntity,
  usePaginated,
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
};
