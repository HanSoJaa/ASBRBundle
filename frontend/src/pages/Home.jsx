import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import UpcomingProducts from '../components/UpcomingProducts'

const Home = () => {
  return (
    <div className="min-h-screen bg-background-dark text-surface">
      <Hero />
      <LatestCollection />
      <UpcomingProducts />
    </div>
  )
}

export default Home
