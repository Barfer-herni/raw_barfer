'use server'

import { revalidatePath } from 'next/cache';
import { database } from '@repo/database';
import { PriceSection, PriceType } from '@repo/database';

/**
 * Tipos para el servicio de precios
 */
export interface PriceData {
    id?: string;
    section: PriceSection;
    product: string;
    weight?: string | null;
    priceType: PriceType;
    price: number;
    isActive?: boolean;
}

export interface PriceFormData {
    section: PriceSection;
    product: string;
    weight?: string;
    priceType: PriceType;
    price: number;
    isActive?: boolean;
}

export interface GetPricesParams {
    section?: PriceSection;
    product?: string;
    priceType?: PriceType;
    isActive?: boolean;
}

/**
 * Obtener todos los precios con filtros opcionales
 */
export async function getPrices(params?: GetPricesParams) {
    try {
        const whereClause: any = {};

        if (params?.section) {
            whereClause.section = params.section;
        }

        if (params?.product) {
            whereClause.product = {
                contains: params.product,
                mode: 'insensitive'
            };
        }

        if (params?.priceType) {
            whereClause.priceType = params.priceType;
        }

        if (params?.isActive !== undefined) {
            whereClause.isActive = params.isActive;
        }

        const prices = await database.price.findMany({
            where: whereClause,
            orderBy: [
                { section: 'asc' },
                { product: 'asc' },
                { weight: 'asc' },
                { priceType: 'asc' }
            ],
        });

        return {
            success: true,
            prices,
        };
    } catch (error) {
        console.error('Error al obtener precios:', error);
        return {
            success: false,
            message: 'Error al obtener los precios',
            error: 'FETCH_PRICES_ERROR'
        };
    }
}

/**
 * Obtener un precio por ID
 */
export async function getPriceById(id: string) {
    try {
        const price = await database.price.findUnique({
            where: { id },
        });

        if (!price) {
            return {
                success: false,
                message: 'Precio no encontrado',
                error: 'PRICE_NOT_FOUND'
            };
        }

        return {
            success: true,
            price,
        };
    } catch (error) {
        console.error('Error al obtener precio:', error);
        return {
            success: false,
            message: 'Error al obtener el precio',
            error: 'FETCH_PRICE_ERROR'
        };
    }
}

/**
 * Crear un nuevo precio
 */
export async function createPrice(data: PriceFormData) {
    try {
        // Verificar si ya existe un precio con la misma combinación
        const existingPrice = await database.price.findFirst({
            where: {
                section: data.section,
                product: data.product,
                weight: data.weight || null,
                priceType: data.priceType
            }
        });

        if (existingPrice) {
            return {
                success: false,
                message: 'Ya existe un precio para esta combinación',
                error: 'PRICE_ALREADY_EXISTS'
            };
        }

        const price = await database.price.create({
            data: {
                section: data.section,
                product: data.product,
                weight: data.weight || null,
                priceType: data.priceType,
                price: data.price,
                isActive: data.isActive ?? true,
            },
        });

        revalidatePath('/admin/prices');

        return {
            success: true,
            price,
            message: 'Precio creado exitosamente'
        };
    } catch (error) {
        console.error('Error al crear precio:', error);
        return {
            success: false,
            message: 'Error al crear el precio',
            error: 'CREATE_PRICE_ERROR'
        };
    }
}

/**
 * Actualizar un precio existente
 */
export async function updatePrice(id: string, data: Partial<PriceFormData>) {
    try {
        const existingPrice = await database.price.findUnique({
            where: { id },
        });

        if (!existingPrice) {
            return {
                success: false,
                message: 'Precio no encontrado',
                error: 'PRICE_NOT_FOUND'
            };
        }

        // Si se está actualizando la combinación única, verificar que no exista ya
        if (data.section || data.product || data.weight !== undefined || data.priceType) {
            const newCombination = {
                section: data.section ?? existingPrice.section,
                product: data.product ?? existingPrice.product,
                weight: data.weight !== undefined ? (data.weight || null) : existingPrice.weight,
                priceType: data.priceType ?? existingPrice.priceType
            };

            const duplicatePrice = await database.price.findFirst({
                where: newCombination
            });

            if (duplicatePrice && duplicatePrice.id !== id) {
                return {
                    success: false,
                    message: 'Ya existe un precio para esta combinación',
                    error: 'PRICE_ALREADY_EXISTS'
                };
            }
        }

        const updatedPrice = await database.price.update({
            where: { id },
            data: {
                ...(data.section && { section: data.section }),
                ...(data.product && { product: data.product }),
                ...(data.weight !== undefined && { weight: data.weight || null }),
                ...(data.priceType && { priceType: data.priceType }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });

        revalidatePath('/admin/prices');

        return {
            success: true,
            price: updatedPrice,
            message: 'Precio actualizado exitosamente'
        };
    } catch (error) {
        console.error('Error al actualizar precio:', error);
        return {
            success: false,
            message: 'Error al actualizar el precio',
            error: 'UPDATE_PRICE_ERROR'
        };
    }
}

/**
 * Eliminar un precio
 */
export async function deletePrice(id: string) {
    try {
        const existingPrice = await database.price.findUnique({
            where: { id },
        });

        if (!existingPrice) {
            return {
                success: false,
                message: 'Precio no encontrado',
                error: 'PRICE_NOT_FOUND'
            };
        }

        await database.price.delete({
            where: { id },
        });

        revalidatePath('/admin/prices');

        return {
            success: true,
            message: 'Precio eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error al eliminar precio:', error);
        return {
            success: false,
            message: 'Error al eliminar el precio',
            error: 'DELETE_PRICE_ERROR'
        };
    }
}

/**
 * Inicializar precios por defecto según la estructura definida
 */
export async function initializeDefaultPrices() {
    try {
        const defaultPrices: PriceFormData[] = [
            // PERRO - POLLO
            { section: 'PERRO', product: 'POLLO', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'POLLO', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'POLLO', weight: '5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'PERRO', product: 'POLLO', weight: '10KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'POLLO', weight: '10KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'POLLO', weight: '10KG', priceType: 'MAYORISTA', price: 0 },

            // PERRO - VACA
            { section: 'PERRO', product: 'VACA', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'VACA', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'VACA', weight: '5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'PERRO', product: 'VACA', weight: '10KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'VACA', weight: '10KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'VACA', weight: '10KG', priceType: 'MAYORISTA', price: 0 },

            // PERRO - CERDO
            { section: 'PERRO', product: 'CERDO', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'CERDO', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'CERDO', weight: '5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'PERRO', product: 'CERDO', weight: '10KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'CERDO', weight: '10KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'CERDO', weight: '10KG', priceType: 'MAYORISTA', price: 0 },

            // PERRO - CORDERO
            { section: 'PERRO', product: 'CORDERO', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'CORDERO', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'CORDERO', weight: '5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'PERRO', product: 'CORDERO', weight: '10KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'CORDERO', weight: '10KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'CORDERO', weight: '10KG', priceType: 'MAYORISTA', price: 0 },

            // PERRO - BIG DOG
            { section: 'PERRO', product: 'BIG DOG VACA', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'BIG DOG VACA', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'BIG DOG VACA', priceType: 'MAYORISTA', price: 0 },
            { section: 'PERRO', product: 'BIG DOG POLLO', priceType: 'EFECTIVO', price: 0 },
            { section: 'PERRO', product: 'BIG DOG POLLO', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'PERRO', product: 'BIG DOG POLLO', priceType: 'MAYORISTA', price: 0 },

            // GATO
            { section: 'GATO', product: 'POLLO', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'GATO', product: 'POLLO', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'GATO', product: 'POLLO', weight: '5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'GATO', product: 'VACA', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'GATO', product: 'VACA', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'GATO', product: 'VACA', weight: '5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'GATO', product: 'CORDERO', weight: '5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'GATO', product: 'CORDERO', weight: '5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'GATO', product: 'CORDERO', weight: '5KG', priceType: 'MAYORISTA', price: 0 },

            // OTROS
            { section: 'OTROS', product: 'HUESOS CARNOSOS 5KG', priceType: 'EFECTIVO', price: 0 },
            { section: 'OTROS', product: 'HUESOS CARNOSOS 5KG', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'OTROS', product: 'HUESOS CARNOSOS 5KG', priceType: 'MAYORISTA', price: 0 },
            { section: 'OTROS', product: 'COMPLEMENTOS', priceType: 'EFECTIVO', price: 0 },
            { section: 'OTROS', product: 'COMPLEMENTOS', priceType: 'TRANSFERENCIA', price: 0 },
            { section: 'OTROS', product: 'COMPLEMENTOS', priceType: 'MAYORISTA', price: 0 },
            { section: 'OTROS', product: 'CORNALITOS', priceType: 'MAYORISTA', price: 0 },
            { section: 'OTROS', product: 'GARRAS', priceType: 'MAYORISTA', price: 0 },
            { section: 'OTROS', product: 'CALDO DE HUESOS', priceType: 'MAYORISTA', price: 0 },
            { section: 'OTROS', product: 'HUESOS RECREATIVOS', priceType: 'MAYORISTA', price: 0 },
        ];

        let created = 0;
        let skipped = 0;

        for (const priceData of defaultPrices) {
            const result = await createPrice(priceData);
            if (result.success) {
                created++;
            } else {
                skipped++;
            }
        }

        return {
            success: true,
            message: `Inicialización completada: ${created} precios creados, ${skipped} precios omitidos (ya existían)`,
            stats: { created, skipped }
        };
    } catch (error) {
        console.error('Error al inicializar precios:', error);
        return {
            success: false,
            message: 'Error al inicializar los precios por defecto',
            error: 'INITIALIZE_PRICES_ERROR'
        };
    }
} 