import React, { useState, useEffect } from 'react'
import Title from './Title'
import ProductItem from './ProductItem'
import axios from 'axios'
import { backendUrl } from '../App'

const BestSeller = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${backendUrl}/api/product/list`)
        
        if (response.data.success) {
          // Get first 4 products as best sellers (you can modify this logic)
          const bestSellers = response.data.products.slice(0, 4)
          setProducts(bestSellers)
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBestSellers()
  }, [])

  if (loading) {
    return (
      <div className='my-10'>
        <div className='text-center text-3xl py-8'>
          <Title text1={'BEST'} text2={'SELLERS'}/>
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Discover our most popular and trending products
          </p>
        </div>
        <div className='flex justify-center items-center py-8'>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLERS'}/>
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Discover our most popular and trending products
        </p>
      </div>
      
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 max-w-7xl mx-auto px-4'>
        {products.map((product) => (
          <ProductItem key={product.productID} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className='text-center py-8 text-gray-500'>
          No products available at the moment
        </div>
      )}
    </div>
  )
}

export default BestSeller
