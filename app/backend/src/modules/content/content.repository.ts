import { query } from '../../shared/config/db';

export interface SiteContentRow {
  id: number;
  slug: string;
  section: string;
  kind: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  label: string | null;
  sort_order: number;
  is_active: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function listContent(onlyActive: boolean) {
  const sql = `
    SELECT id, slug, section, kind, title, body, image_url, link_url, label,
           sort_order, is_active, published_at, created_at, updated_at
      FROM site_content
     ${onlyActive ? 'WHERE is_active = TRUE' : ''}
     ORDER BY section, sort_order, id
  `;
  return query(sql);
}

export async function findContentById(id: number) {
  return query(
    `SELECT id, slug, section, kind, title, body, image_url, link_url, label,
            sort_order, is_active, published_at, created_at, updated_at
       FROM site_content WHERE id = $1`,
    [id]
  );
}

export async function findContentBySlug(slug: string) {
  return query(`SELECT id FROM site_content WHERE slug = $1`, [slug]);
}

export async function insertContent(input: {
  slug: string;
  section: string;
  kind: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  label: string | null;
  sort_order: number;
  is_active: boolean;
  published_at: Date | null;
}) {
  return query(
    `INSERT INTO site_content
       (slug, section, kind, title, body, image_url, link_url, label, sort_order, is_active, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, slug, section, kind, title, body, image_url, link_url, label,
               sort_order, is_active, published_at, created_at, updated_at`,
    [
      input.slug,
      input.section,
      input.kind,
      input.title,
      input.body,
      input.image_url,
      input.link_url,
      input.label,
      input.sort_order,
      input.is_active,
      input.published_at,
    ]
  );
}

export async function updateContent(id: number, input: {
  section: string;
  kind: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  label: string | null;
  sort_order: number;
  is_active: boolean;
  published_at: Date | null;
}) {
  return query(
    `UPDATE site_content SET
       section = $2, kind = $3, title = $4, body = $5, image_url = $6,
       link_url = $7, label = $8, sort_order = $9, is_active = $10,
       published_at = $11, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, slug, section, kind, title, body, image_url, link_url, label,
               sort_order, is_active, published_at, created_at, updated_at`,
    [
      id,
      input.section,
      input.kind,
      input.title,
      input.body,
      input.image_url,
      input.link_url,
      input.label,
      input.sort_order,
      input.is_active,
      input.published_at,
    ]
  );
}

export async function deleteContent(id: number) {
  return query(`DELETE FROM site_content WHERE id = $1 RETURNING id`, [id]);
}
