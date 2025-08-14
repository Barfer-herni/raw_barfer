'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    priceRange: string;
    category: string;
    image: string;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        setQuantity(1); // Reset quantity after adding
    };

    const incrementQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <div className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl overflow-hidden">
            {/* Product Image */}
            <div className="relative overflow-hidden bg-gray-50">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-4">
                {/* Product Name */}
                <h3 className="text-base lg:text-lg font-bold text-gray-900 line-clamp-2 min-h-[3rem] flex items-center">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center">
                    <span className="text-lg font-bold text-barfer-orange">
                        ${product.priceRange}
                    </span>
                </div>

                {/* Quantity Counter */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                            onClick={decrementQuantity}
                            disabled={quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-2 min-w-[3rem] text-center font-medium">
                            {quantity}
                        </span>
                        <button
                            onClick={incrementQuantity}
                            className="p-2 hover:bg-gray-100 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-barfer-green hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    );
}
