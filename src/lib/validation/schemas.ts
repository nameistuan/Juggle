import { z, coerce } from 'zod'

/** ISO-8601 datetime from JSON (string) or Date */
export const zDateTime = coerce.date()

export const plannedDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'plannedDate must be YYYY-MM-DD')

export const TASK_STATUSES = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as const
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export const taskStatusSchema = z.enum(TASK_STATUSES)
export const taskPrioritySchema = z.enum(TASK_PRIORITIES)

const nullableUuid = z.union([z.string().uuid(), z.null()])

export const taskCreateSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.union([zDateTime, z.null()]).optional(),
    plannedDate: z.union([plannedDateString, z.null()]).optional(),
    projectId: nullableUuid.optional(),
    order: z.number().finite().optional(),
  })
  .strict()

export const taskUpdateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.union([zDateTime, z.null()]).optional(),
    plannedDate: z.union([plannedDateString, z.null()]).optional(),
    projectId: nullableUuid.optional(),
    order: z.number().finite().optional(),
    /** If sent, update only when it matches current row (optimistic concurrency) */
    updatedAt: z.union([z.string(), zDateTime]).optional(),
  })
  .strict()

export const eventCreateSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    startTime: zDateTime,
    endTime: zDateTime,
    taskId: z.string().uuid().nullable().optional(),
    projectId: nullableUuid.optional(),
    isFluid: z.boolean().optional(),
    isAllDay: z.boolean().optional(),
    recurrenceRule: z.string().nullable().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'endTime must be after startTime',
        path: ['endTime'],
      })
    }
  })

export const eventUpdateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    startTime: zDateTime.optional(),
    endTime: zDateTime.optional(),
    taskId: z.string().uuid().nullable().optional(),
    projectId: nullableUuid.optional(),
    isFluid: z.boolean().optional(),
    isAllDay: z.boolean().optional(),
    recurrenceRule: z.string().nullable().optional(),
    updatedAt: z.union([z.string(), zDateTime]).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.startTime !== undefined && data.endTime !== undefined && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'endTime must be after startTime',
        path: ['endTime'],
      })
    }
  })

export const projectCreateSchema = z
  .object({
    name: z.string().trim().min(1),
    color: z.string().min(1).optional(),
  })
  .strict()

export const projectUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    color: z.string().min(1).optional(),
  })
  .strict()
  .refine((d) => d.name !== undefined || d.color !== undefined, {
    message: 'At least one of name or color is required',
  })

export type TaskCreateInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type EventCreateInput = z.infer<typeof eventCreateSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
