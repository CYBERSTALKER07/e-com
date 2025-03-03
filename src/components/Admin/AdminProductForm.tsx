import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import ImageUpload from './ImageUpload';

interface AdminProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ product, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [specifications, setSpecifications] = useState<Record<string, string>>({});
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description);
      setImage(product.image);
      setCategory(product.category);
      setSpecifications(product.specifications);
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'Название обязательно';
    if (!price.trim()) newErrors.price = 'Цена обязательна';
    else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) 
      newErrors.price = 'Цена должна быть положительным числом';
    
    if (!description.trim()) newErrors.description = 'Описание обязательно';
    if (!image.trim()) newErrors.image = 'Изображение обязательно';
    if (!category.trim()) newErrors.category = 'Категория обязательна';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const productData: Product = {
      id: product?.id || '',
      name,
      price: parseFloat(price),
      description,
      image,
      category,
      specifications,
    };
    
    onSave(productData);
  };

  const handleAddSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setSpecifications(prev => ({
        ...prev,
        [specKey]: specValue
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...specifications };
    delete newSpecs[key];
    setSpecifications(newSpecs);
  };

  const handleImageUploaded = (url: string) => {
    setImage(url);
    if (errors.image) {
      const newErrors = { ...errors };
      delete newErrors.image;
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Название товара
          </label>
          <input
            type="text"
            id="name"
            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Цена ($)
          </label>
          <input
            type="text"
            id="price"
            className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            id="description"
            rows={4}
            className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Изображение товара
          </label>
          <ImageUpload 
            onImageUploaded={handleImageUploaded} 
            currentImageUrl={image}
          />
          {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select
            id="category"
            className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Выберите категорию</option>
            <option value="outerwear">Верхняя одежда</option>
            <option value="suits">Костюмы</option>
            <option value="shirts">Рубашки</option>
            <option value="knitwear">Трикотаж</option>
            <option value="footwear">Обувь</option>
            <option value="accessories">Аксессуары</option>
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Характеристики
          </label>
          
          <div className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ключ (напр., Материал)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
              />
              <input
                type="text"
                placeholder="Значение (напр., 100% хлопок)"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
              />
              <button
                type="button"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                onClick={handleAddSpecification}
              >
                Добавить
              </button>
            </div>
          </div>
          
          {Object.keys(specifications).length > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Текущие характеристики</h4>
              <div className="space-y-2">
                {Object.entries(specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-white p-2 rounded-md border border-gray-200">
                    <div>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveSpecification(key)}
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            {product ? 'Обновить товар' : 'Добавить товар'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminProductForm;