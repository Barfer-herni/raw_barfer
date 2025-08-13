'use server'

import { getCollection, ObjectId } from '@repo/database';
import type { AdminProduct, CreateAdminProduct } from '../types/barfer';

/**
 * Crear un nuevo producto (solo administradores)
 */
export async function createProduct(productData: CreateAdminProduct, createdBy: string): Promise<{ success: boolean; product?: AdminProduct; message?: string; error?: string }> {
    try {
        const productsCollection = await getCollection('productos');
        
        // Verificar que la categoría existe
        const categoriesCollection = await getCollection('categorias');
        const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(productData.categoria) });
        
        if (!categoryExists) {
            return {
                success: false,
                message: 'La categoría especificada no existe',
                error: 'CATEGORY_NOT_FOUND'
            };
        }

        const newProduct: Omit<AdminProduct, '_id'> = {
            titulo: productData.titulo,
            descripcion: productData.descripcion,
            precioMinorista: productData.precioMinorista,
            precioMayorista: productData.precioMayorista,
            stock: productData.stock,
            imagen: productData.imagen,
            categoria: productData.categoria,
            dimensiones: productData.dimensiones,
            isActive: true,
            createdBy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await productsCollection.insertOne(newProduct);

        const createdProduct: AdminProduct = {
            _id: result.insertedId.toString(),
            ...newProduct
        };

        return {
            success: true,
            product: createdProduct
        };
    } catch (error) {
        console.error('Error al crear producto:', error);
        return {
            success: false,
            message: 'Error interno del servidor al crear el producto',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener todos los productos
 */
export async function getAllProducts(includeInactive = false): Promise<AdminProduct[]> {
    try {
        const productsCollection = await getCollection('productos');
        
        const filter = includeInactive ? {} : { isActive: true };
        const products = await productsCollection.find(filter).sort({ createdAt: -1 }).toArray();

        return products.map(product => ({
            _id: product._id.toString(),
            titulo: product.titulo,
            descripcion: product.descripcion,
            precioMinorista: product.precioMinorista,
            precioMayorista: product.precioMayorista,
            stock: product.stock,
            imagen: product.imagen,
            categoria: product.categoria,
            dimensiones: product.dimensiones,
            isActive: product.isActive,
            createdBy: product.createdBy,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

/**
 * Obtener un producto por ID
 */
export async function getProductById(productId: string): Promise<AdminProduct | null> {
    try {
        const productsCollection = await getCollection('productos');
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (!product) {
            return null;
        }

        return {
            _id: product._id.toString(),
            titulo: product.titulo,
            descripcion: product.descripcion,
            precioMinorista: product.precioMinorista,
            precioMayorista: product.precioMayorista,
            stock: product.stock,
            imagen: product.imagen,
            categoria: product.categoria,
            dimensiones: product.dimensiones,
            isActive: product.isActive,
            createdBy: product.createdBy,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        return null;
    }
}

/**
 * Actualizar un producto
 */
export async function updateProduct(productId: string, updateData: Partial<CreateAdminProduct>): Promise<{ success: boolean; product?: AdminProduct; message?: string; error?: string }> {
    try {
        const productsCollection = await getCollection('productos');

        // Si se actualiza la categoría, verificar que existe
        if (updateData.categoria) {
            const categoriesCollection = await getCollection('categorias');
            const categoryExists = await categoriesCollection.findOne({ _id: new ObjectId(updateData.categoria) });
            
            if (!categoryExists) {
                return {
                    success: false,
                    message: 'La categoría especificada no existe',
                    error: 'CATEGORY_NOT_FOUND'
                };
            }
        }

        const updateFields = {
            ...updateData,
            updatedAt: new Date().toISOString(),
        };

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: 'Producto no encontrado',
                error: 'PRODUCT_NOT_FOUND'
            };
        }

        const updatedProduct = await getProductById(productId);

        return {
            success: true,
            product: updatedProduct!
        };
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return {
            success: false,
            message: 'Error interno del servidor al actualizar el producto',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Eliminar un producto (soft delete)
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const productsCollection = await getCollection('productos');

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            { 
                $set: { 
                    isActive: false,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                message: 'Producto no encontrado',
                error: 'PRODUCT_NOT_FOUND'
            };
        }

        return {
            success: true,
            message: 'Producto eliminado exitosamente'
        };
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return {
            success: false,
            message: 'Error interno del servidor al eliminar el producto',
            error: 'SERVER_ERROR'
        };
    }
}

/**
 * Obtener productos por categoría
 */
export async function getProductsByCategory(categoryId: string): Promise<AdminProduct[]> {
    try {
        const productsCollection = await getCollection('productos');
        
        const products = await productsCollection.find({ 
            categoria: categoryId, 
            isActive: true 
        }).sort({ createdAt: -1 }).toArray();

        return products.map(product => ({
            _id: product._id.toString(),
            titulo: product.titulo,
            descripcion: product.descripcion,
            precioMinorista: product.precioMinorista,
            precioMayorista: product.precioMayorista,
            stock: product.stock,
            imagen: product.imagen,
            categoria: product.categoria,
            dimensiones: product.dimensiones,
            isActive: product.isActive,
            createdBy: product.createdBy,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));
    } catch (error) {
        console.error('Error al obtener productos por categoría:', error);
        return [];
    }
}

/**
 * Buscar productos por término
 */
export async function searchProducts(searchTerm: string): Promise<AdminProduct[]> {
    try {
        const productsCollection = await getCollection('productos');
        
        const products = await productsCollection.find({ 
            $and: [
                { isActive: true },
                {
                    $or: [
                        { titulo: { $regex: searchTerm, $options: 'i' } },
                        { descripcion: { $regex: searchTerm, $options: 'i' } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 }).toArray();

        return products.map(product => ({
            _id: product._id.toString(),
            titulo: product.titulo,
            descripcion: product.descripcion,
            precioMinorista: product.precioMinorista,
            precioMayorista: product.precioMayorista,
            stock: product.stock,
            imagen: product.imagen,
            categoria: product.categoria,
            dimensiones: product.dimensiones,
            isActive: product.isActive,
            createdBy: product.createdBy,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }));
    } catch (error) {
        console.error('Error al buscar productos:', error);
        return [];
    }
}
