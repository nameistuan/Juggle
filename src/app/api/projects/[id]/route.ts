import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  isPrismaNotFound,
  jsonError,
  readJsonBody,
  validationError,
} from '@/lib/api/route-errors'
import { projectUpdateSchema } from '@/lib/validation/schemas'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await readJsonBody(request)
  if (!body.ok) return body.response

  const parsed = projectUpdateSchema.safeParse(body.data)
  if (!parsed.success) return validationError(parsed.error)

  const d = parsed.data
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.color !== undefined && { color: d.color }),
      },
    })
    return NextResponse.json(project)
  } catch (error) {
    if (isPrismaNotFound(error)) return jsonError('Project not found', 404)
    console.error('Failed to update project:', error)
    return jsonError('Failed to update project', 500)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isPrismaNotFound(error)) return jsonError('Project not found', 404)
    console.error('Failed to delete project:', error)
    return jsonError('Failed to delete project', 500)
  }
}
