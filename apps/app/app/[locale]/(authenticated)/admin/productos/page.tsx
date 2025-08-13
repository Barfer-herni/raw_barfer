'use client';

import { useState, useEffect } from 'react';
import { 
    createProductAction, 
    getAllProductsAction, 
    getAllCategoriesAction, 
    createCategoryAction,
    uploadImageAction,
    validateImageFile,
    checkAdminRoleAction,
    updateProductAction,
    deleteProductAction,
    type AdminProduct, 
    type CreateAdminProduct, 
    type ProductCategory, 
    type CreateProductCategory
} from '@repo/data-services/src/actions';

export default function ProductosAdminPage() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Estados del formulario de producto
    const [productForm, setProductForm] = useState<CreateAdminProduct>({
        titulo: '',
        descripcion: '',
        precioMinorista: 0,
        precioMayorista: 0,
        stock: 0,
        imagen: '',
        categoria: '',
        dimensiones: {
            alto: undefined,
            ancho: undefined,
            profundidad: undefined,
            peso: undefined
        }
    });

    // Estados del formulario de categoría
    const [categoryForm, setCategoryForm] = useState<CreateProductCategory>({
        name: '',
        description: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Verificar si el usuario es administrador
            const adminCheck = await checkAdminRoleAction();
            setIsAdmin(adminCheck.isAdmin);
            setCurrentUser(adminCheck.user);

            if (!adminCheck.isAdmin) {
                setIsLoading(false);
                return;
            }

            const [productsResult, categoriesResult] = await Promise.all([
                getAllProductsAction(true), // Incluir inactivos para admin
                getAllCategoriesAction()
            ]);
            
            if (productsResult.success && productsResult.products) {
                setProducts(productsResult.products);
            }
            
            if (categoriesResult.success && categoriesResult.categories) {
                setCategories(categoriesResult.categories);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar archivo
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'productos');
            
            const result = await uploadImageAction(formData);
            if (result.success && result.url) {
                setProductForm(prev => ({ ...prev, imagen: result.url! }));
            } else {
                alert(result.message || 'Error al subir imagen');
            }
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            alert('Error al subir imagen');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productForm.titulo || !productForm.categoria) {
            alert('Título y categoría son obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createProductAction(productForm);
            if (result.success) {
                alert('Producto creado exitosamente');
                setShowProductForm(false);
                resetProductForm();
                loadData();
            } else {
                alert(result.message || 'Error al crear producto');
            }
        } catch (error) {
            console.error('Error creando producto:', error);
            alert('Error al crear producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryForm.name) {
            alert('El nombre de la categoría es obligatorio');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createCategoryAction(categoryForm);
            if (result.success) {
                alert('Categoría creada exitosamente');
                setShowCategoryForm(false);
                setCategoryForm({ name: '', description: '' });
                loadData();
            } else {
                alert(result.message || 'Error al crear categoría');
            }
        } catch (error) {
            console.error('Error creando categoría:', error);
            alert('Error al crear categoría');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetProductForm = () => {
        setProductForm({
            titulo: '',
            descripcion: '',
            precioMinorista: 0,
            precioMayorista: 0,
            stock: 0,
            imagen: '',
            categoria: '',
            dimensiones: {
                alto: undefined,
                ancho: undefined,
                profundidad: undefined,
                peso: undefined
            }
        });
        setEditingProduct(null);
    };

    const handleEditProduct = (product: AdminProduct) => {
        setEditingProduct(product);
        setProductForm({
            titulo: product.titulo,
            descripcion: product.descripcion || '',
            precioMinorista: product.precioMinorista,
            precioMayorista: product.precioMayorista,
            stock: product.stock,
            imagen: product.imagen || '',
            categoria: product.categoria,
            dimensiones: product.dimensiones || {
                alto: undefined,
                ancho: undefined,
                profundidad: undefined,
                peso: undefined
            }
        });
        setShowProductForm(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct || !productForm.titulo || !productForm.categoria) {
            alert('Título y categoría son obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updateProductAction(editingProduct._id!, productForm);
            if (result.success) {
                alert('Producto actualizado exitosamente');
                setShowProductForm(false);
                resetProductForm();
                loadData();
            } else {
                alert(result.message || 'Error al actualizar producto');
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            alert('Error al actualizar producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            const result = await deleteProductAction(productId);
            if (result.success) {
                alert('Producto eliminado exitosamente');
                loadData();
            } else {
                alert(result.message || 'Error al eliminar producto');
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar producto');
        }
    };

    // Función para verificar si una URL de imagen es válida
    const checkImageUrl = async (url: string): Promise<boolean> => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            console.log(`Verificando imagen ${url}: ${response.status} ${response.statusText}`);
            return response.ok;
        } catch (error) {
            console.error('Error verificando URL de imagen:', url, error);
            return false;
        }
    };

    // Función para probar conectividad con Cloudinary
    const testCloudinaryConnection = async () => {
        console.log('🔧 Iniciando test completo de Cloudinary...');
        console.log('Cloud name confirmado: fidelitycode');
        
        // Test 1: Imagen de muestra oficial de Cloudinary
        const officialSample = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
        const officialValid = await checkImageUrl(officialSample);
        
        // Test 2: Imagen de muestra en tu cloud
        const yourSample = 'https://res.cloudinary.com/fidelitycode/image/upload/sample.jpg';
        const yourSampleValid = await checkImageUrl(yourSample);
        
        // Test 3: URL problemática específica
        const problemUrl = 'https://res.cloudinary.com/fidelitycode/image/upload/v1755093408/productos/pdllnokuya70rnjack6s.jpg';
        const problemValid = await checkImageUrl(problemUrl);
        
        // Test 4: URL sin versión
        const noVersionUrl = 'https://res.cloudinary.com/fidelitycode/image/upload/productos/pdllnokuya70rnjack6s.jpg';
        const noVersionValid = await checkImageUrl(noVersionUrl);
        
        // Test 5: Test de acceso con fetch directo
        console.log('🔍 Testando acceso directo...');
        try {
            const directResponse = await fetch(problemUrl, { 
                method: 'HEAD',
                mode: 'cors'
            });
            console.log(`Direct fetch status: ${directResponse.status}`);
            console.log(`Direct fetch headers:`, Object.fromEntries(directResponse.headers.entries()));
        } catch (error) {
            console.error('Error en fetch directo:', error);
        }
        
        console.log('📊 Resultados del test:');
        console.log(`Demo cloud (control): ${officialValid ? '✅' : '❌'}`);
        console.log(`Tu cloud sample: ${yourSampleValid ? '✅' : '❌'}`);
        console.log(`Imagen problemática: ${problemValid ? '✅' : '❌'}`);
        console.log(`Sin versión: ${noVersionValid ? '✅' : '❌'}`);
        
        // Diagnóstico mejorado
        if (!officialValid) {
            console.error('🚨 Problema de conectividad general con Cloudinary');
        } else if (problemValid || noVersionValid) {
            console.log('✅ ¡Tu configuración de Cloudinary está funcionando correctamente!');
            console.log('✅ Las imágenes son accesibles');
            if (!yourSampleValid) {
                console.log('ℹ️ Tu cloud no tiene imagen "sample.jpg" (esto es normal)');
            }
            if (problemValid && noVersionValid) {
                console.log('✅ La imagen problemática SÍ existe y es accesible');
                console.log('💡 Si aún no se ve en la página, intenta:');
                console.log('   1. Limpiar cache del navegador (Ctrl+F5)');
                console.log('   2. Recargar la página');
                console.log('   3. Verificar consola de Network tab');
            }
        } else if (!problemValid && !noVersionValid) {
            console.error('🚨 La imagen específica no existe en tu cloud');
            console.log('💡 La imagen fue eliminada o nunca se subió correctamente');
        } else if (!problemValid && noVersionValid) {
            console.error('🚨 Problema con la versión de la imagen');
            console.log('💡 La imagen existe pero con diferente versión');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barfer-green mx-auto mb-4"></div>
                    <p className="text-gray-600 font-nunito">Cargando productos...</p>
                </div>
            </div>
        );
    }

    // Verificar permisos de administrador
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-poppins mb-4">
                        Acceso Denegado
                    </h1>
                    <p className="text-gray-600 font-nunito mb-6">
                        No tienes permisos para acceder a la gestión de productos.
                    </p>
                    <a
                        href="/admin"
                        className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        Volver al Panel
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 font-poppins mb-2">
                        Gestión de Productos
                    </h1>
                    <p className="text-gray-600 font-nunito">
                        Administra el catálogo de productos de la tienda
                    </p>
                    
                    {/* Debug button - solo visible en desarrollo */}
                    {process.env.NODE_ENV === 'development' && (
                        <button
                            onClick={testCloudinaryConnection}
                            className="mt-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded font-nunito"
                        >
                            🔧 Test Cloudinary
                        </button>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <button
                        onClick={() => setShowProductForm(true)}
                        className="bg-barfer-green hover:bg-green-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        + Agregar Producto
                    </button>
                    <button
                        onClick={() => setShowCategoryForm(true)}
                        className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                    >
                        + Nueva Categoría
                    </button>
                </div>

                {/* Lista de productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-barfer-white rounded-2xl shadow-lg border-2 border-barfer-green p-4 hover:shadow-xl transition-all transform hover:scale-105">
                            {product.imagen ? (
                                <img
                                    src={product.imagen}
                                    alt={product.titulo}
                                    className="w-full h-48 object-cover rounded-xl mb-4"
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                        console.warn('⚠️ Error cargando imagen:', product.imagen);
                                        
                                        // Intentar una sola recarga con cache-busting
                                        if (!e.currentTarget.dataset.retried) {
                                            console.log('🔄 Reintentando carga de imagen...');
                                            e.currentTarget.dataset.retried = 'true';
                                            const imgElement = e.currentTarget as HTMLImageElement;
                                            setTimeout(() => {
                                                if (imgElement && imgElement.parentNode) {
                                                    imgElement.src = product.imagen + '?t=' + Date.now();
                                                }
                                            }, 500);
                                            return;
                                        }
                                        
                                        // Si falló el retry, mostrar placeholder simple
                                        console.error('❌ No se pudo cargar la imagen:', product.imagen);
                                        
                                        const placeholder = document.createElement('div');
                                        placeholder.className = 'w-full h-48 bg-gray-100 border-2 border-gray-200 rounded-xl mb-4 flex items-center justify-center';
                                        placeholder.innerHTML = `
                                            <div class="text-center p-4">
                                                <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p class="text-xs text-gray-600 font-medium">Imagen no disponible</p>
                                                <button class="mt-2 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors" onclick="location.reload()">
                                                    Recargar
                                                </button>
                                            </div>
                                        `;
                                        
                                        const originalImg = e.currentTarget as HTMLImageElement;
                                        if (originalImg.parentNode) {
                                            originalImg.parentNode.replaceChild(placeholder, originalImg);
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <h3 className="font-bold text-lg mb-2 font-poppins">{product.titulo}</h3>
                            {product.descripcion && (
                                <p className="text-gray-600 text-sm mb-3 font-nunito">{product.descripcion}</p>
                            )}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Minorista:</span>
                                    <span className="font-semibold text-barfer-orange">${product.precioMinorista}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Mayorista:</span>
                                    <span className="font-semibold text-barfer-green">${product.precioMayorista}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Stock:</span>
                                    <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button 
                                    onClick={() => handleEditProduct(product)}
                                    className="flex-1 bg-barfer-green hover:bg-green-600 text-white py-2 rounded-xl text-sm font-medium transition-colors font-nunito"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDeleteProduct(product._id!)}
                                    className="flex-1 bg-barfer-orange hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium transition-colors font-nunito"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal Formulario de Producto */}
                {showProductForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-barfer-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold font-poppins">
                                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowProductForm(false);
                                            resetProductForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={editingProduct ? handleUpdateProduct : handleProductSubmit} className="space-y-4">
                                    {/* Título */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={productForm.titulo}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Nombre del producto"
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={productForm.descripcion}
                                            onChange={(e) => setProductForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Descripción del producto"
                                        />
                                    </div>

                                    {/* Precios */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Precio Minorista *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={productForm.precioMinorista}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, precioMinorista: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Precio Mayorista *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={productForm.precioMayorista}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, precioMayorista: parseFloat(e.target.value) || 0 }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Stock y Categoría */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Stock *
                                            </label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                value={productForm.stock}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Categoría *
                                            </label>
                                            <select
                                                required
                                                value={productForm.categoria}
                                                onChange={(e) => setProductForm(prev => ({ ...prev, categoria: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categories.map((category) => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Imagen */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Imagen
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                        />
                                        {uploadingImage && (
                                            <p className="text-sm text-blue-600 mt-2">Subiendo imagen...</p>
                                        )}
                                        {productForm.imagen && (
                                            <img
                                                src={productForm.imagen}
                                                alt="Preview"
                                                className="mt-2 w-32 h-32 object-cover rounded-xl"
                                            />
                                        )}
                                    </div>

                                    {/* Dimensiones */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Dimensiones del Paquete
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.alto || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            alto: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                    placeholder="Alto (cm)"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.ancho || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            ancho: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                    placeholder="Ancho (cm)"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.profundidad || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            profundidad: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                    placeholder="Prof. (cm)"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={productForm.dimensiones?.peso || ''}
                                                    onChange={(e) => setProductForm(prev => ({
                                                        ...prev,
                                                        dimensiones: {
                                                            ...prev.dimensiones,
                                                            peso: parseFloat(e.target.value) || undefined
                                                        }
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green text-sm"
                                                    placeholder="Peso (kg)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowProductForm(false);
                                                resetProductForm();
                                            }}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || uploadingImage}
                                            className="flex-1 bg-barfer-green hover:bg-green-600 disabled:bg-gray-400 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            {isSubmitting 
                                                ? (editingProduct ? 'Actualizando...' : 'Creando...') 
                                                : (editingProduct ? 'Actualizar Producto' : 'Crear Producto')
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Formulario de Categoría */}
                {showCategoryForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-barfer-white rounded-2xl shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold font-poppins">Nueva Categoría</h2>
                                    <button
                                        onClick={() => setShowCategoryForm(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleCategorySubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Nombre de la categoría"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-barfer-green focus:border-barfer-green"
                                            placeholder="Descripción de la categoría"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryForm(false)}
                                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-barfer-orange hover:bg-orange-600 disabled:bg-gray-400 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            {isSubmitting ? 'Creando...' : 'Crear Categoría'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
