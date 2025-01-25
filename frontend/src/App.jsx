import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [priceFilter, setPriceFilter] = useState(100);
  const [ratingFilter, setRatingFilter] = useState(4);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    company: '',
    rating: '',
    featured: false
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      const response = await axios.post(`${backendUrl}/login`, { email, password });
      setToken(response.data.accessToken);
      setIsLoggedIn(true);
      fetchProducts(response.data.accessToken);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      await axios.post(`${backendUrl}/signup`, { email, password });
      alert('Signup successful');
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  };

  const generateProductId = (products) => {
    const validProducts = products.filter(
      (product) => product.productId && typeof product.productId === 'string' && product.productId.startsWith('P')
    );
  
    const lastProductId = validProducts.length > 0 
      ? validProducts[validProducts.length - 1].productId 
      : 'P000';
  
    const number = parseInt(lastProductId.slice(1), 10) + 1;
  
    return `P${number.toString().padStart(3, '0')}`;
  };
  

  const fetchProducts = async (authToken) => {
    try {
      const response = await axios.get(`${backendUrl}/products`, {
        headers: { Authorization: `Bearer ${authToken || token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const newProductId = generateProductId(products);
      const productData = {
        ...productForm,
        productId: newProductId,
        price: Number(productForm.price),
        rating: Number(productForm.rating)
      };

      await axios.post(`${backendUrl}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchProducts();
      resetForm();
    } catch (error) {
      alert('Failed to add product: ' + error.message);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${backendUrl}/products/${editingProduct._id}`, {
        ...productForm,
        price: Number(productForm.price),
        rating: Number(productForm.rating)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      resetForm();
      setEditingProduct(null);
    } catch (error) {
      alert('Failed to update product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`${backendUrl}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product: ' + error.message);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/products/featured`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch featured products', error);
    }
  };

  // const fetchProductsByPrice = async (maxPrice) => {
  //   try {
  //     const response = await axios.get(`${backendUrl}/products/price/${maxPrice}`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setProducts(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch products by price', error);
  //   }
  // };

  // const fetchProductsByRating = async (minRating) => {
  //   try {
  //     const response = await axios.get(`${backendUrl}/products/rating/${minRating}`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setProducts(response.data);
  //   } catch (error) {
  //     console.error('Failed to fetch products by rating', error);
  //   }
  // };

  const resetForm = () => {
    setProductForm({
      name: '',
      price: '',
      company: '',
      rating: '',
      featured: false
    });
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      company: product.company,
      rating: product.rating,
      featured: product.featured
    });
  };

  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    // Fetch all products on initial load to calculate max price
    const fetchMaxPrice = async () => {
      try {
        const response = await axios.get(`${backendUrl}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allProducts = response.data;
        const highestPrice = Math.max(...allProducts.map((p) => p.price));
        setMaxPrice(highestPrice);
        setPriceFilter(highestPrice); // Default the filter to the max price
      } catch (error) {
        console.error("Failed to fetch products for max price:", error);
      }
    };

    if (isLoggedIn) {
      fetchMaxPrice();
    }
  }, [isLoggedIn, token, backendUrl]);

  const fetchProductsByPriceAndRating = async () => {
    try {
      // Fetch products filtered by price
      const priceResponse = await axios.get(
        `${backendUrl}/products/price/${priceFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch products filtered by rating
      const ratingResponse = await axios.get(
        `${backendUrl}/products/rating/${ratingFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Combine the results: Keep only products present in both filtered sets
      const priceFilteredProducts = priceResponse.data;
      const ratingFilteredProducts = ratingResponse.data;

      const combinedFilteredProducts = priceFilteredProducts.filter((product) =>
        ratingFilteredProducts.some((ratingProduct) => ratingProduct._id === product._id)
      );

      setProducts(combinedFilteredProducts);
    } catch (error) {
      console.error("Failed to fetch filtered products:", error);
    }
  };
  

  return (
    <div className="container mx-auto p-4">
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl">
          <div className="max-w-md w-full p-6 bg-white shadow-lg rounded-2xl">
            <h1 className="text-2xl font-bold text-center mb-6">Login/Signup</h1>
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <button
                  onClick={handleToggle}
                  className={`px-4 py-2 rounded-l-md ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Login
                </button>
                <button
                  onClick={handleToggle}
                  className={`px-4 py-2 rounded-r-md ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  Signup
                </button>
              </div>
              {isLogin ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Login</h2>
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white p-3 rounded-md font-medium hover:bg-blue-600 transition cursor-pointer"
                    >
                      Login
                    </button>
                  </form>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold mb-4">Signup</h2>
                  <form className="space-y-4" onSubmit={handleSignup}>
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-green-500 text-white p-3 rounded-md font-medium hover:bg-green-600 transition cursor-pointer"
                    >
                      Signup
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl mb-4">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </h2>
          <form 
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} 
            className="max-w-md mb-8"
          >
            <input 
              type="text" 
              name="name" 
              placeholder="Name" 
              value={productForm.name}
              onChange={handleProductInputChange}
              required 
              className="w-full p-2 border mb-2"
            />
            <input 
              type="number" 
              name="price" 
              placeholder="Price" 
              value={productForm.price}
              onChange={handleProductInputChange}
              required 
              className="w-full p-2 border mb-2"
            />
            <input 
              type="text" 
              name="company" 
              placeholder="Company" 
              value={productForm.company}
              onChange={handleProductInputChange}
              required 
              className="w-full p-2 border mb-2"
            />
            <input 
              type="number" 
              name="rating" 
              placeholder="Rating" 
              value={productForm.rating}
              onChange={handleProductInputChange}
              step="0.1" 
              min="0" 
              max="5" 
              className="w-full p-2 border mb-2"
            />
            <label className="block mb-2">
              <input 
                type="checkbox" 
                name="featured"
                checked={productForm.featured}
                onChange={handleProductInputChange}
                className="mr-2"
              />
              Featured Product
            </label>
            <button 
              type="submit" 
              className="w-full bg-blue-500 text-white p-2 cursor-pointer"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editingProduct && (
              <button 
                type="button" 
                onClick={() => {
                  resetForm();
                  setEditingProduct(null);
                }}
                className="w-full bg-gray-500 text-white p-2 mt-2 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </form>
          
          <div className="space-x-4 mb-4 w-md">
          <h2 className="text-xl font-semibold mb-4">Filter Products</h2>
          {/* Price Filter */}
          <div className="mb-4">
            <label className="block mb-2">Price Filter: ${priceFilter}</label>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Rating Filter */}
          <div className="mb-4">
            <label className="block mb-2">Rating Filter: {ratingFilter}+</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full"
            />
          </div>

          <button
            onClick={fetchProductsByPriceAndRating}
            className="bg-blue-500 text-white p-2 rounded cursor-pointer"
          >
            Apply Filters
          </button>

          <button 
              onClick={() => fetchProducts()} 
              className="bg-blue-500 text-white p-2 rounded cursor-pointer"
            >
              All Products
            </button>

            <button 
              onClick={() => fetchFeaturedProducts()} 
              className="bg-green-500 text-white p-2 rounded cursor-pointer"
            >
              Featured Products
            </button>
        </div>

          {/* Products List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map(product => (
              <div 
                key={product._id} 
                className="p-4 rounded shadow-sm border border-gray-300"
              >
                <h3 className="font-bold">{product.productId}: {product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>Company: {product.company}</p>
                <p>Rating: {product.rating}</p>
                {product.featured && (
                  <span className="text-green-500">Featured</span>
                )}
                <div className="mt-2 flex space-x-2">
                  <button 
                    onClick={() => startEditProduct(product)}
                    className="bg-blue-500 text-white py-1 px-3  rounded cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-500 text-white py-1 px-3 rounded cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;