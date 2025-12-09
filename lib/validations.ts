import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  role: z.enum(['ADMIN', 'COMPANY', 'USER']),
  companyId: z.string().optional(),
})

export const updateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  role: z.enum(['ADMIN', 'COMPANY', 'USER']).optional(),
  companyId: z.string().optional(),
  isActive: z.boolean().optional(),
})

// Company validation schemas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const updateCompanySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  tokenBalance: z.number().int().min(0).optional(),
})

// Package validation schemas
export const createPackageSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  type: z.enum(['PAY_PER_USE', 'PACKAGE']),
  tokensAmount: z.number().int().min(1, 'Le nombre de tokens doit être supérieur à 0'),
  price: z.number().min(0, 'Le prix doit être supérieur ou égal à 0'),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export const updatePackageSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  description: z.string().optional(),
  type: z.enum(['PAY_PER_USE', 'PACKAGE']).optional(),
  tokensAmount: z.number().int().min(1).optional(),
  price: z.number().min(0).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// Transaction validation schemas
export const createTransactionSchema = z.object({
  companyId: z.string(),
  packageId: z.string().optional(),
  type: z.enum(['PURCHASE', 'USAGE', 'REFUND']),
  amount: z.number().min(0),
  tokensAmount: z.number().int(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const updateTransactionSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type CreatePackageInput = z.infer<typeof createPackageSchema>
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
