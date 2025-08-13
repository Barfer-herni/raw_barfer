'use client';

import { useState, useEffect } from 'react';
import { checkAdminRoleAction, getProductsForHomeAction } from '@repo/data-services/src/actions';

interface Product {
    id: string;
    name: string;
    description: string;
    priceRange: string;
    category: string;
    image: string;
}

interface CartItem extends Product {
    quantity: number;
}

// Imágenes del carrusel de perros
const CAROUSEL_IMAGES = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=1200&h=400&fit=crop',
        alt: 'Perro Golden Retriever feliz',
        title: 'Mascotas Felices'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=400&fit=crop',
        alt: 'Perro Husky jugando',
        title: 'Juguetes Divertidos'
    },
    {
        id: 3,
        src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=400&fit=crop',
        alt: 'Perro durmiendo en cama',
        title: 'Descanso Tranquilo'
    },
    {
        id: 4,
        src: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=1200&h=400&fit=crop',
        alt: 'Perro Labrador en el parque',
        title: 'Aventuras al Aire Libre'
    }
];

// Fotos de perros de clientes para la sección USTEDES
const CLIENT_PHOTOS = [
    {
        id: 1,
        src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop',
        alt: 'Luna - Golden Retriever',
        owner: 'María G.',
        comment: '¡Luna ama su nueva cama!'
    },
    {
        id: 2,
        src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
        alt: 'Milo - Gato Persa',
        owner: 'Carlos R.',
        comment: 'Milo está más feliz que nunca'
    },
    {
        id: 3,
        src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop',
        alt: 'Rocky - Pastor Alemán',
        owner: 'Ana L.',
        comment: 'Los juguetes son geniales'
    },
    {
        id: 4,
        src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=300&fit=crop',
        alt: 'Bella - Husky Siberiano',
        owner: 'Roberto M.',
        comment: 'Bella adora sus nuevos accesorios'
    },
    {
        id: 5,
        src: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=300&h=300&fit=crop',
        alt: 'Max - Labrador',
        owner: 'Sofia P.',
        comment: 'Max está más saludable que nunca'
    },
    {
        id: 6,
        src: 'https://images.unsplash.com/photo-1601758228041-3b9a0a2b0b0b?w=300&h=300&fit=crop',
        alt: 'Nina - Bulldog Francés',
        owner: 'Diego S.',
        comment: 'Nina ama su shampoo natural'
    },
    {
        id: 7,
        src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
        alt: 'Thor - Rottweiler',
        owner: 'Valentina C.',
        comment: 'Thor está más tranquilo'
    },
    {
        id: 8,
        src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop',
        alt: 'Lola - Maine Coon',
        owner: 'Miguel A.',
        comment: 'Lola está más activa'
    }
];

// Datos de los beneficios
const BENEFITS_DATA = [
    {
        id: 1,
        title: 'Salud Mental',
        icon: '🧠',
        description: 'Los productos para mascotas contribuyen significativamente a la salud mental tanto de los animales como de sus dueños. Los juguetes interactivos estimulan la cognición, reducen la ansiedad y previenen problemas de comportamiento. La interacción regular con mascotas libera endorfinas y reduce los niveles de estrés.',
        details: [
            'Estimulación cognitiva y mental',
            'Reducción de ansiedad y estrés',
            'Prevención de problemas de comportamiento',
            'Mejora del estado de ánimo',
            'Fortalecimiento del vínculo emocional'
        ]
    },
    {
        id: 2,
        title: 'Relajación',
        icon: '😌',
        description: 'Nuestros productos están diseñados para crear un ambiente de calma y tranquilidad para tu mascota. Desde camas ortopédicas hasta aromaterapia natural, cada elemento está pensado para proporcionar el máximo confort y relajación.',
        details: [
            'Camas ortopédicas con memoria viscoelástica',
            'Ambientes tranquilos y confortables',
            'Reducción del estrés ambiental',
            'Mejora de la calidad del sueño',
            'Espacios seguros y acogedores'
        ]
    },
    {
        id: 3,
        title: 'Entretenimiento',
        icon: '🎾',
        description: 'El entretenimiento es fundamental para el bienestar de las mascotas. Nuestros juguetes y accesorios están diseñados para mantener a tu compañero activo, estimulado y feliz, evitando el aburrimiento y promoviendo un estilo de vida saludable.',
        details: [
            'Juguetes interactivos y educativos',
            'Actividades físicas y mentales',
            'Prevención del aburrimiento',
            'Estimulación de instintos naturales',
            'Fomento de la socialización'
        ]
    },
    {
        id: 4,
        title: '100% Natural',
        icon: '🌿',
        description: 'Comprometidos con la salud y el medio ambiente, todos nuestros productos están elaborados con ingredientes naturales y materiales sostenibles. Sin químicos dañinos, sin conservantes artificiales, solo lo mejor de la naturaleza para tu mascota.',
        details: [
            'Ingredientes orgánicos certificados',
            'Materiales biodegradables',
            'Sin químicos ni conservantes artificiales',
            'Producción sostenible y responsable',
            'Seguro para mascotas y medio ambiente'
        ]
    }
];

// Productos reales para mascotas con imágenes
const SAMPLE_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'Comida Premium para Perros Adultos',
        description: 'Alimento balanceado con proteínas de alta calidad, vitaminas y minerales esenciales',
        priceRange: '3000 - 4000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
    },
    {
        id: '2',
        name: 'Comida para Gatos Sensibles',
        description: 'Alimento hipoalergénico para gatos con estómagos sensibles',
        priceRange: '3500 - 4500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop'
    },
    {
        id: '3',
        name: 'Juguete Interactivo para Perros',
        description: 'Juguete que estimula la mente y reduce la ansiedad por separación',
        priceRange: '2000 - 3000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    },
    {
        id: '4',
        name: 'Cama Ortopédica para Mascotas',
        description: 'Cama con memoria viscoelástica para perros y gatos de todas las edades',
        priceRange: '8000 - 12000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
    },
    {
        id: '5',
        name: 'Shampoo Hipoalergénico',
        description: 'Shampoo sin perfumes para mascotas con piel sensible',
        priceRange: '1500 - 2500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
    },
    {
        id: '6',
        name: 'Collar LED con GPS',
        description: 'Collar inteligente con rastreo GPS y luces LED para visibilidad nocturna',
        priceRange: '15000 - 20000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
    },
    {
        id: '7',
        name: 'Comida Húmeda para Perros',
        description: 'Alimento húmedo premium en lata con carne real y vegetales',
        priceRange: '1000 - 2000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
    },
    {
        id: '8',
        name: 'Rascador para Gatos Premium',
        description: 'Rascador de múltiples niveles con sisal natural y plataforma superior',
        priceRange: '7000 - 10000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop'
    },
    {
        id: '9',
        name: 'Vitaminas para Mascotas',
        description: 'Suplemento vitamínico completo para perros y gatos de todas las edades',
        priceRange: '2500 - 3500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
    },
    {
        id: '10',
        name: 'Transportín Seguro',
        description: 'Transportín de plástico resistente con ventilación y cierre seguro',
        priceRange: '4000 - 6000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
    },
    {
        id: '11',
        name: 'Cepillo Deslanador',
        description: 'Cepillo profesional para eliminar pelo muerto y nudos',
        priceRange: '2000 - 3000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
    },
    {
        id: '12',
        name: 'Comida para Aves Exóticas',
        description: 'Mezcla de semillas premium para loros, canarios y aves exóticas',
        priceRange: '1500 - 2500',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop'
    },
    {
        id: '13',
        name: 'Juguete para Gatos con Hierba Gatera',
        description: 'Juguete interactivo con hierba gatera natural para estimular el juego',
        priceRange: '1000 - 2000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop'
    },
    {
        id: '14',
        name: 'Cama para Mascotas Pequeñas',
        description: 'Cama suave y acogedora para perros y gatos de razas pequeñas',
        priceRange: '4000 - 6000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
    },
    {
        id: '15',
        name: 'Kit de Limpieza Dental',
        description: 'Kit completo para el cuidado dental de tu mascota',
        priceRange: '3000 - 4000',
        category: 'heras',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop'
    }
];

// Preguntas frecuentes
const FAQ_DATA = [
    {
        id: 1,
        question: '¿Los productos son seguros para todas las razas de mascotas?',
        answer: 'Sí, todos nuestros productos están formulados y diseñados para ser seguros para todas las razas de perros y gatos. Hemos realizado extensas pruebas de seguridad y seguimos estrictos estándares de calidad. Sin embargo, si tu mascota tiene alguna condición médica específica o alergias conocidas, recomendamos consultar con tu veterinario antes de usar cualquier producto nuevo.'
    },
    {
        id: 2,
        question: '¿Cuánto tiempo tarda en llegar mi pedido?',
        answer: 'Los tiempos de entrega varían según tu ubicación. En general, los pedidos se procesan en 1-2 días hábiles y la entrega toma entre 3-7 días hábiles. Ofrecemos envío express para entregas en 1-2 días hábiles por un costo adicional. Recibirás un número de seguimiento por email para rastrear tu pedido en tiempo real.'
    },
    {
        id: 3,
        question: '¿Qué hago si mi mascota no le gusta el producto?',
        answer: 'Ofrecemos una garantía de satisfacción de 30 días. Si tu mascota no está completamente satisfecha con cualquier producto, puedes devolverlo dentro de los 30 días posteriores a la compra para obtener un reembolso completo o cambio. El producto debe estar en su empaque original y en condiciones de reventa. Nuestro equipo de servicio al cliente te ayudará con el proceso de devolución.'
    },
    {
        id: 4,
        question: '¿Los ingredientes son realmente 100% naturales?',
        answer: 'Absolutamente. Nos comprometemos con la transparencia total en nuestros ingredientes. Todos nuestros productos alimenticios contienen ingredientes orgánicos certificados sin conservantes artificiales, colorantes o saborizantes. Nuestros juguetes y accesorios están hechos con materiales sostenibles y no tóxicos. Puedes encontrar la lista completa de ingredientes en cada producto y tenemos certificaciones disponibles bajo solicitud.'
    },
    {
        id: 5,
        question: '¿Ofrecen descuentos por compras al por mayor?',
        answer: 'Sí, ofrecemos descuentos especiales para compras al por mayor y clientes frecuentes. Los descuentos comienzan a partir de 5 unidades del mismo producto (5% de descuento), 10 unidades (10% de descuento) y 20 unidades o más (15% de descuento). También tenemos un programa de fidelidad donde acumulas puntos con cada compra que puedes canjear por descuentos futuros.'
    },
    {
        id: 6,
        question: '¿Puedo cambiar o cancelar mi pedido después de realizarlo?',
        answer: 'Puedes cambiar o cancelar tu pedido sin costo alguno dentro de las primeras 2 horas después de realizarlo, siempre que no haya sido procesado aún. Después de este tiempo, si el pedido ya está en preparación, se aplicará una tarifa de cambio del 10%. Una vez que el pedido ha sido enviado, no se pueden realizar cambios, pero puedes usar nuestra política de devolución de 30 días si es necesario.'
    }
];

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
    const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);
    const [currentClientPhotoIndex, setCurrentClientPhotoIndex] = useState(0);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

    // Verificar permisos de administrador
    useEffect(() => {
        const checkAdminRole = async () => {
            try {
                const result = await checkAdminRoleAction();
                setIsAdmin(result.isAdmin);
            } catch (error) {
                console.error('Error verificando rol de admin:', error);
                setIsAdmin(false);
            } finally {
                setIsLoadingAdmin(false);
            }
        };

        checkAdminRole();
    }, []);

    // Cargar productos reales desde la base de datos
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const result = await getProductsForHomeAction();
                if (result.success && result.products) {
                    setProducts(result.products);
                } else {
                    console.error('Error cargando productos:', result.message);
                    // Fallback a productos de ejemplo si falla la carga
                    setProducts(SAMPLE_PRODUCTS);
                }
            } catch (error) {
                console.error('Error cargando productos:', error);
                // Fallback a productos de ejemplo si falla la carga
                setProducts(SAMPLE_PRODUCTS);
            } finally {
                setIsLoadingProducts(false);
            }
        };

        loadProducts();
    }, []);

    // Auto-play del carrusel principal
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentCarouselIndex((prevIndex) =>
                (prevIndex + 1) % CAROUSEL_IMAGES.length
            );
        }, 5000); // Cambia cada 5 segundos

        return () => clearInterval(interval);
    }, []);

    // Auto-play del carrusel de clientes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentClientPhotoIndex((prevIndex) =>
                (prevIndex + 1) % CLIENT_PHOTOS.length
            );
        }, 3000); // Cambia cada 3 segundos

        return () => clearInterval(interval);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentCarouselIndex(index);
    };

    const nextSlide = () => {
        setCurrentCarouselIndex((prevIndex) =>
            (prevIndex + 1) % CAROUSEL_IMAGES.length
        );
    };

    const prevSlide = () => {
        setCurrentCarouselIndex((prevIndex) =>
            prevIndex === 0 ? CAROUSEL_IMAGES.length - 1 : prevIndex - 1
        );
    };

    const goToClientPhoto = (index: number) => {
        setCurrentClientPhotoIndex(index);
    };

    const nextClientPhoto = () => {
        setCurrentClientPhotoIndex((prevIndex) =>
            (prevIndex + 1) % CLIENT_PHOTOS.length
        );
    };

    const prevClientPhoto = () => {
        setCurrentClientPhotoIndex((prevIndex) =>
            prevIndex === 0 ? CLIENT_PHOTOS.length - 1 : prevIndex - 1
        );
    };

    const toggleBenefit = (benefitId: number) => {
        setExpandedBenefit(expandedBenefit === benefitId ? null : benefitId);
    };

    const toggleFAQ = (faqId: number) => {
        setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
    };

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart(prevCart => [...prevCart, {
                ...product,
                quantity: 1
            }]);
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const getTotalPrice = () => {
        // Como ahora tenemos rangos de precio, usamos el precio medio para el cálculo
        return cart.reduce((total, item) => {
            const [min, max] = item.priceRange.split(' - ').map(p => parseInt(p));
            const avgPrice = (min + max) / 2;
            return total + (avgPrice * item.quantity);
        }, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const checkout = () => {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        // Guardar carrito en localStorage para la página de checkout
        localStorage.setItem('barfer-cart', JSON.stringify(cart));

        // Redirigir a la página de checkout
        window.location.href = '/admin/checkout';
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-barfer-white to-orange-50 w-full">
            {/* Navbar fijo con carrito y admin */}
            <nav className="fixed top-20 right-4 z-40 flex flex-col gap-3">
                <div className="relative">
                    <button
                        onClick={toggleCart}
                        className="relative p-4 bg-barfer-orange hover:bg-orange-600 text-barfer-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                />
                            </svg>

                            {/* Badge con cantidad de items */}
                            {getTotalItems() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                                    {getTotalItems()}
                                </span>
                            )}
                        </button>

                        {/* Carrito desplegable */}
                        {isCartOpen && (
                            <div className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50" onClick={toggleCart}>
                                <div className="absolute top-4 bottom-4 right-4 w-96 bg-barfer-white border-2 border-barfer-green rounded-2xl shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                    <div className="p-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-bold font-poppins">Carrito de Compras</h2>
                                            <button
                                                onClick={toggleCart}
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {cart.length} producto{cart.length !== 1 ? 's' : ''} en el carrito
                                        </p>
                                    </div>

                                    <div className="p-4">
                                        {cart.length === 0 ? (
                                            <p className="text-center text-gray-500 py-8">
                                                Tu carrito está vacío
                                            </p>
                                        ) : (
                                            <>
                                                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                                    {cart.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3 p-3 bg-green-50 border border-barfer-green rounded-2xl">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm font-nunito">{item.name}</p>
                                                                <p className="text-sm text-barfer-green font-semibold">
                                                                    ${item.priceRange}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="w-8 h-8 border border-barfer-green rounded-xl flex items-center justify-center hover:bg-barfer-green hover:text-barfer-white text-barfer-green transition-colors"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="w-8 h-8 border border-barfer-green rounded-xl flex items-center justify-center hover:bg-barfer-green hover:text-barfer-white text-barfer-green transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                                <button
                                                                    onClick={() => removeFromCart(item.id)}
                                                                    className="w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="border-t pt-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-lg font-semibold">Total:</span>
                                                        <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                                                            ${getTotalPrice().toFixed(0)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={checkout}
                                                        className="w-full bg-barfer-orange hover:bg-orange-600 text-barfer-white py-3 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
                                                    >
                                                        Proceder al Checkout
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                </div>

                {/* Botón de administración de productos - Solo para administradores */}
                {!isLoadingAdmin && isAdmin && (
                    <a
                        href="/admin/productos"
                        className="p-4 bg-barfer-green hover:bg-green-600 text-barfer-white rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                        title="Gestión de Productos"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </a>
                )}
            </nav>

            {/* Contenido principal */}
            <div className="w-full">
                {/* Carrusel de Fotos de Perros */}
                <div className="mb-8">
                <div className="relative overflow-hidden rounded-xl shadow-2xl">
                    {/* Imágenes del carrusel */}
                    <div className="relative h-96">
                        {CAROUSEL_IMAGES.map((image, index) => (
                            <div
                                key={image.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentCarouselIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay con título */}
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
                                    <div className="p-8 text-white">
                                        <h2 className="text-4xl font-bold mb-2 font-poppins">{image.title}</h2>
                                        <p className="text-xl opacity-90 font-nunito">Descubre productos increíbles para tu mascota</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botones de navegación */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-barfer-green bg-opacity-90 hover:bg-opacity-100 text-barfer-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-32 top-1/2 -translate-y-1/2 bg-barfer-green bg-opacity-90 hover:bg-opacity-100 text-barfer-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Indicadores de puntos */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {CAROUSEL_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${index === currentCarouselIndex
                                        ? 'bg-white scale-125'
                                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista de Productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-12">
                {isLoadingProducts ? (
                    // Skeleton loading para productos
                    Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="border rounded-lg p-3 animate-pulse">
                            <div className="mb-3">
                                <div className="bg-gray-300 w-full h-48 rounded-lg"></div>
                            </div>
                            <div className="bg-gray-300 h-6 rounded mb-2"></div>
                            <div className="bg-gray-300 h-4 rounded mb-2"></div>
                            <div className="bg-gray-300 h-5 rounded w-20 mb-3"></div>
                            <div className="bg-gray-300 h-10 rounded"></div>
                        </div>
                    ))
                ) : products.length > 0 ? (
                    products.map((product) => (
                    <div
                        key={product.id}
                        className="border rounded-lg p-3 hover:shadow-lg transition-all"
                    >
                        <div className="mb-3">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-contain rounded-lg bg-gray-50"
                            />
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {product.name}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-3 text-xs line-clamp-2">
                            {product.description}
                        </p>

                        <div className="text-center mb-2">
                            <span className="text-sm font-bold text-barfer-orange">
                                ${product.priceRange}
                            </span>
                        </div>

                        <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-barfer-green hover:bg-green-600 text-barfer-white px-2 py-2 rounded-xl text-xs font-medium transition-colors shadow-md hover:shadow-lg transform hover:scale-105 font-nunito"
                        >
                            Agregar
                        </button>
                    </div>
                    ))
                ) : (
                    // Mensaje cuando no hay productos
                    <div className="col-span-full text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No hay productos disponibles</p>
                            <p className="text-sm">Los productos aparecerán aquí una vez que sean agregados por el administrador.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de BENEFICIOS */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 font-poppins">
                    BENEFICIOS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {BENEFITS_DATA.map((benefit) => (
                        <div
                            key={benefit.id}
                            className="border-2 border-barfer-green rounded-2xl overflow-hidden hover:shadow-xl transition-all bg-barfer-white transform hover:scale-105"
                        >
                            {/* Header del beneficio */}
                            <div
                                className="p-6 cursor-pointer bg-gradient-to-r from-green-50 to-orange-50"
                                onClick={() => toggleBenefit(benefit.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{benefit.icon}</span>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            {benefit.title}
                                        </h3>
                                    </div>
                                    <button className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors">
                                        <svg
                                            className={`w-6 h-6 transform transition-transform ${expandedBenefit === benefit.id ? 'rotate-45' : 'rotate-0'
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Contenido expandible */}
                            {expandedBenefit === benefit.id && (
                                <div className="p-6 bg-white dark:bg-gray-900 border-t border-sky-200 dark:border-sky-800">
                                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                        {benefit.description}
                                    </p>

                                    <ul className="space-y-2">
                                        {benefit.details.map((detail, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-sky-500 dark:text-sky-400 mt-1">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sección USTEDES - Carrusel de Fotos de Clientes */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 font-poppins">
                    USTEDES
                </h2>

                <div className="relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-r from-green-50 to-orange-50 border-2 border-barfer-green p-8">
                    {/* Imágenes del carrusel de clientes */}
                    <div className="relative h-64">
                        {CLIENT_PHOTOS.map((photo, index) => (
                            <div
                                key={photo.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentClientPhotoIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4">
                                        <img
                                            src={photo.src}
                                            alt={photo.alt}
                                            className="w-32 h-32 object-cover rounded-full border-4 border-barfer-green shadow-lg"
                                        />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {photo.alt}
                                    </h3>
                                    <p className="text-barfer-orange font-bold mb-2">
                                        {photo.owner}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 italic">
                                        "{photo.comment}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botones de navegación */}
                    <button
                        onClick={prevClientPhoto}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-barfer-green bg-opacity-90 hover:bg-opacity-100 text-barfer-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={nextClientPhoto}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-barfer-green bg-opacity-90 hover:bg-opacity-100 text-barfer-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Indicadores de puntos */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {CLIENT_PHOTOS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToClientPhoto(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentClientPhotoIndex
                                        ? 'bg-sky-500 scale-125'
                                        : 'bg-sky-300 hover:bg-sky-400'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Sección de Preguntas Frecuentes */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 font-poppins">
                    PREGUNTAS FRECUENTES
                </h2>

                <div className="w-full space-y-4">
                    {FAQ_DATA.map((faq) => (
                        <div
                            key={faq.id}
                            className="border-2 border-barfer-green rounded-2xl overflow-hidden hover:shadow-xl transition-all bg-barfer-white transform hover:scale-105"
                        >
                            {/* Pregunta */}
                            <div
                                className="p-6 cursor-pointer bg-gradient-to-r from-green-50 to-orange-50 hover:from-green-100 hover:to-orange-100"
                                onClick={() => toggleFAQ(faq.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                                        {faq.question}
                                    </h3>
                                    <button className="text-barfer-orange hover:text-orange-600 transition-colors flex-shrink-0">
                                        <svg
                                            className={`w-6 h-6 transform transition-transform ${expandedFAQ === faq.id ? 'rotate-45' : 'rotate-0'
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Respuesta expandible */}
                            {expandedFAQ === faq.id && (
                                <div className="p-6 bg-barfer-white border-t border-barfer-green">
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Información de contacto adicional */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        ¿No encuentras la respuesta que buscas?
                    </p>
                    <button className="bg-barfer-orange hover:bg-orange-600 text-barfer-white px-8 py-4 rounded-2xl font-semibold transition-colors shadow-md hover:shadow-xl transform hover:scale-105 font-nunito">
                        Contáctanos
                    </button>
                </div>
            </div>



            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-black text-white mt-16">
                <div className="w-full px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Información de la empresa */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-barfer-green">Barfer</h3>
                            <p className="text-gray-300 leading-relaxed">
                                Tu tienda de confianza para productos premium de mascotas.
                                Comprometidos con la salud y felicidad de tu compañero peludo.
                            </p>
                            <div className="flex space-x-4">
                                {/* Solo Instagram */}
                                <a href="#" className="text-gray-400 hover:text-barfer-orange transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-barfer-orange font-poppins">Contacto</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <a href="mailto:info@barfer.com" className="text-gray-300 hover:text-white transition-colors">
                                        info@barfer.com
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <a href="tel:+541123456789" className="text-gray-300 hover:text-white transition-colors">
                                        +54 11 2345-6789
                                    </a>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        Buenos Aires, Argentina
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5 text-barfer-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-300">
                                        Lun - Vie: 9:00 - 18:00
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de consulta */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <div className="w-full max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-center text-barfer-orange mb-6 font-poppins">
                                ¿Tienes alguna consulta?
                            </h3>
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Tu nombre"
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Tu email"
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Asunto"
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg"
                                />
                                <textarea
                                    placeholder="Tu mensaje"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-barfer-green focus:bg-green-50 transition-all shadow-md hover:shadow-lg resize-none"
                                ></textarea>
                                <button
                                    type="submit"
                                    className="w-full bg-barfer-orange hover:bg-orange-600 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-nunito"
                                >
                                    Enviar Mensaje
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-gray-400">
                                © 2024 Barfer. Todos los derechos reservados.
                            </p>
                            <div className="flex space-x-6 text-sm">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Política de Cookies
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Mapa del Sitio
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    Accesibilidad
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            </div>
        </div>
    );
} 