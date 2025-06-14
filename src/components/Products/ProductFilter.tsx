import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  stores?: { id: string; name: string }[];
  selectedStore?: string | null;
  onStoreChange?: (storeId: string | null) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice = 1000, // Default max price
  stores,
  selectedStore,
  onStoreChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCategoryClick = (category: string | null) => {
    onCategoryChange(category);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onPriceRangeChange([0, priceRange[1]]);
      return;
    }
    
    const newValue = Math.max(0, parseFloat(value));
    if (!isNaN(newValue)) {
      onPriceRangeChange([newValue, Math.max(newValue, priceRange[1])]);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onPriceRangeChange([priceRange[0], maxPrice]);
      return;
    }
    
    const newValue = Math.min(parseFloat(value), maxPrice);
    if (!isNaN(newValue)) {
      onPriceRangeChange([Math.min(priceRange[0], newValue), newValue]);
    }
  };

  const clearFilters = () => {
    onCategoryChange(null);
    onPriceRangeChange([0, maxPrice]);
    if (onStoreChange) {
      onStoreChange(null);
    }
  };

  // Default min and max values for the price inputs with NaN protection
  const minPrice = !isNaN(priceRange[0]) ? Math.max(0, priceRange[0]) : 0;
  const maxPriceValue = !isNaN(priceRange[1]) ? Math.min(priceRange[1], maxPrice) : maxPrice;

  return (
    <div className="mb-8">
      {/* Mobile filter dialog */}
      <div className="md:hidden">
        <button
          type="button"
          className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Фильтры
        </button>

        {isFilterOpen && (
          <div className="fixed inset-0 z-40 overflow-y-auto p-4 bg-gray-500 bg-opacity-75">
            <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-lg font-medium text-gray-900">Фильтры</h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="px-4 py-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Категории</h3>
                <div className="space-y-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === null
                        ? 'bg-primary-light text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCategoryClick(null)}
                  >
                    Все
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-full text-sm capitalize ml-2 ${
                        selectedCategory === category
                          ? 'bg-primary-light text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-medium text-gray-900 mt-6 mb-2">Диапазон цен</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="min-price-mobile" className="text-sm text-gray-600">Мин. цена</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="min-price-mobile"
                          className="pl-7 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          placeholder="0"
                          value={minPrice}
                          onChange={handleMinPriceChange}
                          min={0}
                          max={maxPriceValue}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="max-price-mobile" className="text-sm text-gray-600">Макс. цена</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="max-price-mobile"
                          className="pl-7 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          placeholder={maxPrice.toString()}
                          value={maxPriceValue}
                          onChange={handleMaxPriceChange}
                          min={minPrice}
                          max={maxPrice}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {stores && onStoreChange && (
                  <>
                    <h3 className="text-sm font-medium text-gray-900 mt-6 mb-2">Магазины</h3>
                    <div className="space-y-2">
                      <button
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedStore === null
                            ? 'bg-primary-light text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        onClick={() => onStoreChange(null)}
                      >
                        Все
                      </button>
                      {stores.map(store => (
                        <button
                          key={store.id}
                          className={`px-3 py-1 rounded-full text-sm capitalize ml-2 ${
                            selectedStore === store.id
                              ? 'bg-primary-light text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          onClick={() => onStoreChange(store.id)}
                        >
                          {store.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-dark"
                    onClick={clearFilters}
                  >
                    Очистить все
                  </button>
                  <button
                    type="button"
                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop filter */}
      <div className="hidden md:block">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Фильтры</h3>
            {(selectedCategory !== null || minPrice > 0 || maxPriceValue < maxPrice) && (
              <button
                type="button"
                className="text-sm text-primary hover:text-primary-dark"
                onClick={clearFilters}
              >
                Очистить все
              </button>
            )}
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Категории</h4>
            <div className="space-y-2">
              <button
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === null
                    ? 'bg-primary-light text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                onClick={() => handleCategoryClick(null)}
              >
                Все
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm capitalize ml-2 ${
                    selectedCategory === category
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {stores && onStoreChange && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Магазины</h4>
              <div className="space-y-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedStore === null
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  onClick={() => onStoreChange(null)}
                >
                  Все
                </button>
                {stores.map(store => (
                  <button
                    key={store.id}
                    className={`px-3 py-1 rounded-full text-sm capitalize ml-2 ${
                      selectedStore === store.id
                        ? 'bg-primary-light text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => onStoreChange(store.id)}
                  >
                    {store.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Диапазон цен</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="min-price" className="text-sm text-gray-600">Мин. цена</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="min-price"
                      className="pl-7 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="0"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      min={0}
                      max={maxPriceValue}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="max-price" className="text-sm text-gray-600">Макс. цена</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="max-price"
                      className="pl-7 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder={maxPrice.toString()}
                      value={maxPriceValue}
                      onChange={handleMaxPriceChange}
                      min={minPrice}
                      max={maxPrice}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;