import React, { useState } from 'react';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronRight, Star, Truck, Shield, Clock } from 'lucide-react';

// --- Sample Data ---
const initialProducts = [
  {
    id: 1,
    name: "Advanced Hair Growth Serum",
    sku: "LIL-HAIR-001",
    price: 899,
    mrp: 1299,
    category: "Hair Care",
    image: "https://placehold.co/600x800/e2e8f0/1e293b?text=Hair+Serum",
    description: "Nourishing formula for thicker, stronger hair.",
    stock: 50,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: "Premium Beard Nourishing Oil",
    sku: "LIL-BRD-001",
    price: 599,
    mrp: 799,
    category: "Beard Care",
    image: "https://placehold.co/600x800/e2e8f0/1e293b?text=Beard+Oil",
    description: "Softens beard and promotes healthy growth.",
    stock: 30,
    rating: 4.7,
    reviews: 89
  },
  {
    id: 3,
    name: "Gentle Purifying Face Wash",
    sku: "LIL-SKN-001",
    price: 349,
    mrp: 499,
    category: "Skin Care",
    image: "https://placehold.co/600x800/e2e8f0/1e293b?text=Face+Wash",
    description: "Deep cleansing without stripping natural oils.",
    stock: 100,
    rating: 4.9,
    reviews: 210
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [cart, setCart] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Cart Functions ---
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`${product.name} added to cart!`);
  };

  const updateQuantity = (id, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, Math.min(item.stock, item.quantity + change));
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- UI Components ---
  const Header = () => (
    <header className="sticky top-0 z-50 bg-[#FFFAF0] border-b border-gray-200 shadow-sm">
      <div className="bg-[#0B3B24] text-white text-xs py-2 text-center font-medium tracking-wide">
        FREE SHIPPING ON ORDERS OVER ₹999 | DELIVERING ACROSS HYDERABAD
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setCurrentView('home')}>
            <img 
              src="/Elegant Gold Lily Monogram Logo.png" 
              alt="LILYNT Logo" 
              className="h-14 md:h-16 w-auto object-contain rounded-md"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => setCurrentView('home')} className="text-gray-800 hover:text-[#0B3B24] font-medium">Home</button>
            <button onClick={() => setCurrentView('shop')} className="text-gray-800 hover:text-[#0B3B24] font-medium">Shop All</button>
            <button className="text-gray-800 hover:text-[#0B3B24] font-medium">Hair Care</button>
            <button className="text-gray-800 hover:text-[#0B3B24] font-medium">Beard Care</button>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <button className="text-gray-700 hover:text-[#0B3B24] hidden md:block"><Search size={20} /></button>
            <button className="text-gray-700 hover:text-[#0B3B24] hidden md:block"><Heart size={20} /></button>
            <button className="text-gray-700 hover:text-[#0B3B24]"><User size={20} /></button>
            <button onClick={() => setCurrentView('cart')} className="text-gray-700 hover:text-[#0B3B24] relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  const ProductCard = ({ product }) => {
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    return (
      <div className="group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
          <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-[#D4AF37] text-white text-xs font-bold px-2 py-1 rounded">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category}</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
          <div className="flex items-center mb-3">
            <Star size={14} className="text-[#D4AF37] fill-current" />
            <span className="text-sm text-gray-600 ml-1">{product.rating} ({product.reviews})</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#0B3B24]">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-sm text-gray-400 line-through ml-2">₹{product.mrp}</span>
              )}
            </div>
            <button 
              onClick={() => addToCart(product)}
              className="bg-[#0B3B24] text-white p-2 rounded-full hover:bg-[#1a4a35] transition-colors"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <div className="bg-[#FFFAF0] min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-[#0B3B24] mb-6">Everyday Essentials.<br/>Thoughtfully Chosen.</h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light italic">Rooted in Nature. Growing Beyond Boundaries.</p>
        <button 
          onClick={() => setCurrentView('shop')}
          className="bg-[#0B3B24] text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-[#1a4a35] transition-colors"
        >
          Shop Collection
        </button>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Truck size={32} className="text-[#D4AF37] mb-4" />
            <h4 className="font-semibold text-lg text-[#0B3B24]">Fast Delivery</h4>
            <p className="text-gray-600 text-sm">Priority shipping across Hyderabad</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield size={32} className="text-[#D4AF37] mb-4" />
            <h4 className="font-semibold text-lg text-[#0B3B24]">Premium Quality</h4>
            <p className="text-gray-600 text-sm">Rigorous quality checks</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock size={32} className="text-[#D4AF37] mb-4" />
            <h4 className="font-semibold text-lg text-[#0B3B24]">24/7 Support</h4>
            <p className="text-gray-600 text-sm">Always here to help you</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-serif text-[#0B3B24] mb-2">New Arrivals</h2>
            <p className="text-gray-600">Discover our latest premium essentials.</p>
          </div>
          <button onClick={() => setCurrentView('shop')} className="hidden md:flex items-center text-[#D4AF37] font-medium hover:text-[#b8952f]">
            View All <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {initialProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );

  const CartView = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <h2 className="text-3xl font-serif text-[#0B3B24] mb-8">Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500 mb-6">Your cart is empty.</p>
          <button 
            onClick={() => setCurrentView('shop')}
            className="bg-[#0B3B24] text-white px-6 py-2 rounded-md hover:bg-[#1a4a35]"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-100">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-gray-500 text-sm">₹{item.price}</p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-md">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-gray-50">-</button>
                  <span className="px-3 py-1 border-x border-gray-200 text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-gray-50">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-2">
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-28">
              <h3 className="text-lg font-semibold border-b border-gray-200 pb-4 mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2 text-gray-600"><p>Subtotal</p><p>₹{cartTotal}</p></div>
              <div className="flex justify-between mb-4 text-gray-600"><p>Shipping</p><p>{cartTotal > 999 ? 'FREE' : '₹50'}</p></div>
              <div className="flex justify-between text-lg font-bold text-[#0B3B24] border-t border-gray-200 pt-4 mb-6">
                <p>Total</p><p>₹{cartTotal > 999 ? cartTotal : cartTotal + 50}</p>
              </div>
              <button 
                onClick={() => alert('Proceeding to Checkout...')}
                className="w-full bg-[#0B3B24] text-white py-3 rounded-md font-medium hover:bg-[#1a4a35] transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="font-sans text-gray-900 bg-[#FFFAF0] selection:bg-[#0B3B24] selection:text-white">
      <Header />
      
      <main>
        {currentView === 'home' && <HomeView />}
        {currentView === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
            <h2 className="text-3xl font-serif text-[#0B3B24] mb-8">All Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {initialProducts.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        )}
        {currentView === 'cart' && <CartView />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0B3B24] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            {/* Footer Logo */}
            <div className="mb-6 bg-white inline-block p-2 rounded-md">
                <img 
                  src="/Elegant Gold Lily Monogram Logo.png" 
                  alt="LILYNT Logo" 
                  className="h-16 w-auto object-contain"
                />
            </div>
            <p className="text-gray-300 text-sm mb-4">Rooted in Nature. Growing Beyond Boundaries. Premium consumer essentials delivered across India.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4AF37]">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><button onClick={() => setCurrentView('shop')} className="hover:text-white">All Products</button></li>
              <li><button className="hover:text-white">Hair Care</button></li>
              <li><button className="hover:text-white">Beard Care</button></li>
              <li><button className="hover:text-white">Skin Care</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4AF37]">Policies</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4AF37]">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>LILYNT Group Private Limited</li>
              <li>Hyderabad, Telangana, India</li>
              <li>support@lilynt.com</li>
              <li className="mt-4">
                <button className="border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded hover:bg-[#D4AF37] hover:text-[#0B3B24] transition-colors w-full">
                  WhatsApp Support
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} LILYNT Group Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}