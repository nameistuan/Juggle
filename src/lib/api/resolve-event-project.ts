import prisma from '@/lib/prisma'

/**
 * When creating an event linked to a task, inherit the task's project if the client
 * omitted project or sent null (e.g. drag-from-Kanban flow).
 */
export async function resolveProjectIdForNewEvent(
  taskId: string | null | undefined,
  projectId: string | null | undefined
): Promise<string | null> {
  if (projectId !== undefined && projectId !== null) return projectId
  if (!taskId) return projectId ?? null
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  })
  return task?.projectId ?? null
}
