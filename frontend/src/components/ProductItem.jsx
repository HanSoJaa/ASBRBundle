import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductItem = ({ product }) => {
  const isSoldOut = product.quantity === 0;
  return (
    <motion.div
      className="relative group rounded-3xl overflow-hidden shadow-lg bg-surface/90 border border-background-dark/10 hover:shadow-2xl transition-shadow duration-300"
      whileHover={{ scale: 1.04, borderRadius: '2.5rem', boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18)' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
    >
      <div className={`overflow-hidden relative ${isSoldOut ? 'opacity-60 pointer-events-none' : ''}`}>
          <img 
            src={product.image[0]} 
            alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500 rounded-t-3xl"
          />
      {isSoldOut && (
          <div className="absolute inset-0 bg-background-dark/70 flex items-center justify-center">
            <span className="bg-danger text-white px-4 py-2 rounded-full text-base font-bold shadow-lg animate-pulse">
                Sold Out
              </span>
            </div>
          )}
        </div>
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-semibold text-lg text-primary truncate group-hover:text-accent transition-colors duration-300">{product.name}</h3>
        <p className="text-xl font-bold text-accent">RM{product.price}</p>
        </div>
      {!isSoldOut && (
        <Link to={`/product/${product.productID}`} className="absolute inset-0 z-10" tabIndex={-1} aria-label={`View ${product.name}`}></Link>
      )}
    </motion.div>
  );
};

export default ProductItem;
