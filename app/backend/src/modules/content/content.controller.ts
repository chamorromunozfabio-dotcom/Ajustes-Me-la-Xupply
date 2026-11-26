import { Request, Response, NextFunction } from 'express';
import { logAudit } from '../../shared/lib/audit';
import {
  deleteContent,
  findContentById,
  findContentBySlug,
  insertContent,
  listContent,
  updateContent,
  type SiteContentRow,
} from './content.repository';
import {
  ContentValidationError,
  normalizeContentInput,
  toContentDto,
} from './content.service';

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Endpoint público: solo bloques activos, sin autenticación. */
export async function getPublicContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listContent(true);
    res.json((result.rows as SiteContentRow[]).map(toContentDto));
  } catch (err) {
    next(err);
  }
}

/** Panel Técnico: todos los bloques, activos o no. */
export async function getAdminContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listContent(false);
    res.json((result.rows as SiteContentRow[]).map(toContentDto));
  } catch (err) {
    next(err);
  }
}

export async function createContent(req: Request, res: Response, next: NextFunction) {
  try {
    const input = normalizeContentInput(req.body ?? {});
    if (!input.slug) throw new ContentValidationError('slug es obligatorio');
    const existing = await findContentBySlug(input.slug);
    if (existing.rowCount) {
      return res.status(409).json({ error: 'Ya existe un bloque con ese slug' });
    }

    const publishedAt = input.is_active ? new Date() : null;
    const result = await insertContent({ ...input, slug: input.slug, published_at: publishedAt });
    const dto = toContentDto(result.rows[0] as SiteContentRow);
    await logAudit(req, 'content.create', 'site_content', dto.id, null, dto);
    return res.status(201).json(dto);
  } catch (err) {
    if (err instanceof ContentValidationError) return res.status(400).json({ error: err.message });
    return next(err);
  }
}

export async function updateContentRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const currentResult = await findContentById(id);
    const currentRow = currentResult.rows[0] as SiteContentRow | undefined;
    if (!currentRow) return res.status(404).json({ error: 'Bloque no encontrado' });

    // El slug es inmutable: en PUT es opcional (partial = true).
    const input = normalizeContentInput(req.body ?? {}, true);
    const wasActive = currentRow.is_active;
    const publishedAt = input.is_active
      ? (wasActive ? currentRow.published_at : new Date())
      : currentRow.published_at;

    const result = await updateContent(id, { ...input, published_at: publishedAt });
    const dto = toContentDto(result.rows[0] as SiteContentRow);
    await logAudit(req, 'content.update', 'site_content', id, toContentDto(currentRow), dto);
    return res.json(dto);
  } catch (err) {
    if (err instanceof ContentValidationError) return res.status(400).json({ error: err.message });
    return next(err);
  }
}

export async function toggleContent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const currentResult = await findContentById(id);
    const currentRow = currentResult.rows[0] as SiteContentRow | undefined;
    if (!currentRow) return res.status(404).json({ error: 'Bloque no encontrado' });

    const isActive = !currentRow.is_active;
    const publishedAt = isActive ? new Date() : currentRow.published_at;
    const result = await updateContent(id, {
      section: currentRow.section,
      kind: currentRow.kind,
      title: currentRow.title,
      body: currentRow.body,
      image_url: currentRow.image_url,
      link_url: currentRow.link_url,
      label: currentRow.label,
      sort_order: currentRow.sort_order,
      is_active: isActive,
      published_at: publishedAt,
    });
    const dto = toContentDto(result.rows[0] as SiteContentRow);
    await logAudit(req, isActive ? 'content.publish' : 'content.unpublish', 'site_content', id, toContentDto(currentRow), dto);
    return res.json(dto);
  } catch (err) {
    return next(err);
  }
}

export async function removeContent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const currentResult = await findContentById(id);
    const currentRow = currentResult.rows[0] as SiteContentRow | undefined;
    if (!currentRow) return res.status(404).json({ error: 'Bloque no encontrado' });

    await deleteContent(id);
    await logAudit(req, 'content.delete', 'site_content', id, toContentDto(currentRow), null);
    return res.json({ ok: true, id });
  } catch (err) {
    return next(err);
  }
}
