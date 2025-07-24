import React, { useState, useEffect, useRef } from 'react';
import Title from './Title';
import ProductItem from './ProductItem';
import axios from 'axios';
import { backendUrl } from '../App';
import { motion } from 'framer-motion';

const LatestCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          // Get first 8 products as latest collection (you can modify this logic)
          const latestProducts = response.data.products.slice(0, 8);
          setProducts(latestProducts);
        }
      } catch (error) {
        console.error('Error fetching latest products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    let animationFrame;
    let scrollAmount = 0;
    const speed = 1.5; // px per frame
    function animate() {
      if (scrollContainer.scrollWidth - scrollContainer.clientWidth === 0) return;
      scrollAmount += speed;
      if (scrollAmount >= scrollContainer.scrollWidth / 2) {
        scrollAmount = 0;
      }
      scrollContainer.scrollLeft = scrollAmount;
      animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [products]);

  if (loading) {
    return (
      <div className='my-10'>
        <div className='text-center py-8 text-3xl'>
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-muted'>
            Check out our newest arrivals and latest fashion trends
          </p>
        </div>
        <div className='flex justify-center items-center py-8'>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Duplicate products for seamless looping
  const displayProducts = [...products, ...products];

  return (
    <section className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'LATEST'} text2={'COLLECTIONS'} />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-muted'>
          Check out our newest arrivals and latest fashion trends
        </p>
      </div>
      {/* Auto-scrolling Product Carousel */}
      <div
        ref={scrollRef}
        className="overflow-x-hidden max-w-7xl mx-auto px-4 bg-surface/80 rounded-3xl shadow-xl border border-background-dark/10 backdrop-blur-lg"
        style={{ whiteSpace: 'nowrap', position: 'relative' }}
      >
        <div className="flex gap-4 py-6" style={{ minWidth: 'max-content' }}>
          {displayProducts.map((product, idx) => (
            <div key={product.productID + '-' + idx} className="min-w-[220px] max-w-xs">
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      </div>
      {products.length === 0 && (
        <div className='text-center py-8 text-muted'>
          No products available at the moment
        </div>
      )}
    </section>
  );
};

export default LatestCollection;
