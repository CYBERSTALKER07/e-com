import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wool Overcoat',
    price: 299.99,
    description: 'Luxurious wool overcoat with a tailored fit, perfect for Tashkent winters. Features a classic design with modern details, inner lining for extra warmth, and durable construction that will last for years.',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'outerwear',
    specifications: {
      'Material': '80% Wool, 20% Polyester',
      'Fit': 'Regular fit',
      'Care': 'Dry clean only',
      'Color': 'Charcoal Grey',
      'Origin': 'Imported'
    }
  },
  {
    id: '2',
    name: 'Classic Leather Dress Shoes',
    price: 189.99,
    description: 'Handcrafted leather dress shoes with a polished finish, perfect for formal occasions or business meetings. The cushioned insole provides all-day comfort while the durable outsole ensures longevity.',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'footwear',
    specifications: {
      'Material': 'Genuine Leather',
      'Sole': 'Leather with rubber grip',
      'Closure': 'Lace-up',
      'Color': 'Dark Brown',
      'Style': 'Oxford'
    }
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    price: 249.99,
    description: 'Premium Silk Business Tie',
    image: 'https://images.unsplash.com/photo-1598879445146-5a1d1f0cafb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'accessories',
    specifications: {
      'Material': '100% Silk',
      'Width': '3.5 inches',
      'Pattern': 'Striped',
      'Care': 'Dry clean only',
      'Origin': 'Handmade in Italy'
    }
  },
  {
    id: '4',
    name: 'Slim Fit Cotton Dress Shirt',
    price: 79.99,
    description: 'Crisp cotton dress shirt with a modern slim fit. Perfect for professional settings or formal events. Features wrinkle-resistant fabric, spread collar, and convertible cuffs for versatile styling.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'shirts',
    specifications: {
      'Material': '100% Cotton',
      'Fit': 'Slim fit',
      'Collar': 'Spread',
      'Cuffs': 'Convertible',
      'Care': 'Machine washable'
    }
  },
  {
    id: '5',
    name: 'Leather Messenger Bag',
    price: 149.99,
    description: 'Handcrafted from premium full-grain leather, this messenger bag features multiple compartments, a padded laptop sleeve, adjustable shoulder strap, and antique brass hardware. Perfect for professionals in Tashkent.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'accessories',
    specifications: {
      'Material': 'Full-grain leather',
      'Dimensions': '15" x 11" x 4"',
      'Laptop Compartment': 'Fits up to 15" laptop',
      'Pockets': '3 external, 4 internal',
      'Color': 'Vintage Brown'
    }
  },
  {
    id: '6',
    name: 'Tailored Wool Suit',
    price: 459.99,
    description: 'Impeccably tailored wool suit featuring a two-button jacket with notch lapels and flat-front trousers. Perfect for business meetings, weddings, and formal events in Tashkent. Available with optional alterations.',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'suits',
    specifications: {
      'Material': 'Super 120s Wool',
      'Fit': 'Modern fit',
      'Jacket': 'Two-button, notch lapel',
      'Trousers': 'Flat front, unhemmed',
      'Color': 'Navy Blue'
    }
  },
  {
    id: '7',
    name: 'Designer Sunglasses',
    price: 129.99,
    description: 'Premium designer sunglasses with polarized lenses and UV protection. The lightweight metal frame offers durability while maintaining comfort. A perfect accessory for Tashkent\'s sunny days.',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'accessories',
    specifications: {
      'Frame Material': 'Titanium',
      'Lens': 'Polarized, UV400 Protection',
      'Style': 'Aviator',
      'Color': 'Gold/Green',
      'Includes': 'Protective case and cleaning cloth'
    }
  },
  {
    id: '8',
    name: 'Cashmere Sweater',
    price: 189.99,
    description: 'Luxuriously soft cashmere sweater with a classic crew neck design. Perfect for Tashkent\'s transitional seasons, this versatile piece can be dressed up or down for any occasion while providing exceptional warmth and comfort.',
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    category: 'knitwear',
    specifications: {
      'Material': '100% Cashmere',
      'Neck': 'Crew neck',
      'Weight': 'Medium weight',
      'Care': 'Hand wash cold, lay flat to dry',
      'Color': 'Camel'
    }
  }
];

export const categories = [...new Set(products.map(product => product.category))];