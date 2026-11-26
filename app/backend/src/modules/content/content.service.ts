import type { SiteContentRow } from './content.repository';

export const CONTENT_SECTIONS = ['landing', 'site'] as const;
export const CONTENT_KINDS = ['text', 'array', 'object', 'news', 'banner'] as const;

export interface ContentInput {
  slug?: unknown;
  section?: unknown;
  kind?: unknown;
  title?: unknown;
  body?: unknown;
  image_url?: unknown;
  link_url?: unknown;
  label?: unknown;
  sort_order?: unknown;
  is_active?: unknown;
}

export interface NormalizedContent {
  slug?: string;
  section: string;
  kind: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  label: string | null;
  sort_order: number;
  is_active: boolean;
}

export class ContentValidationError extends Error {}

function optionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new ContentValidationError(`${field} debe ser texto`);
  const text = value.trim();
  if (text.length > max) throw new ContentValidationError(`${field} es demasiado largo (máx. ${max})`);
  return text || null;
}

function serializeBody(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? null : json;
  } catch {
    throw new ContentValidationError('body no es serializable');
  }
}

export function normalizeContentInput(input: ContentInput, partial = false): NormalizedContent {
  const result: NormalizedContent = {
    section: 'landing',
    kind: 'text',
    title: null,
    body: null,
    image_url: null,
    link_url: null,
    label: null,
    sort_order: 0,
    is_active: true,
  };

  if (input.slug !== undefined || !partial) {
    if (typeof input.slug !== 'string' || !/^[a-z0-9]+(?:[-_.][a-z0-9]+)*$/.test(input.slug.trim())) {
      throw new ContentValidationError('slug inválido (usa minúsculas, números, -, _ o .)');
    }
    result.slug = input.slug.trim().slice(0, 120);
  }

  if (input.section !== undefined) {
    if (typeof input.section !== 'string' || !CONTENT_SECTIONS.includes(input.section as any)) {
      throw new ContentValidationError('section inválida');
    }
    result.section = input.section;
  }

  if (input.kind !== undefined) {
    if (typeof input.kind !== 'string' || !CONTENT_KINDS.includes(input.kind as any)) {
      throw new ContentValidationError('kind inválido');
    }
    result.kind = input.kind;
  }

  if (input.title !== undefined) result.title = optionalText(input.title, 'title', 200);
  if (input.body !== undefined) result.body = serializeBody(input.body);
  if (input.image_url !== undefined) result.image_url = optionalText(input.image_url, 'image_url', 500);
  if (input.link_url !== undefined) result.link_url = optionalText(input.link_url, 'link_url', 500);
  if (input.label !== undefined) result.label = optionalText(input.label, 'label', 100);

  if (input.sort_order !== undefined) {
    const value = Number(input.sort_order);
    if (!Number.isInteger(value)) throw new ContentValidationError('sort_order debe ser entero');
    result.sort_order = value;
  }

  if (input.is_active !== undefined) {
    if (typeof input.is_active !== 'boolean') throw new ContentValidationError('is_active debe ser booleano');
    result.is_active = input.is_active;
  }

  return result;
}

export function toContentDto(row: SiteContentRow) {
  let body: unknown = null;
  if (row.body) {
    try {
      body = JSON.parse(row.body);
    } catch {
      body = row.body;
    }
  }
  return {
    id: row.id,
    slug: row.slug,
    section: row.section,
    kind: row.kind,
    title: row.title,
    body,
    image_url: row.image_url,
    link_url: row.link_url,
    label: row.label,
    sort_order: row.sort_order,
    is_active: row.is_active,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
