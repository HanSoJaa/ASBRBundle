import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import bgvideo1 from '../assets/bgvideo1.mp4';

function ShoeModel() {
  const gltf = useGLTF('/src/assets/Nike Shoe V2.glb');
  return <primitive object={gltf.scene} scale={12.5} position={[0, -0.7, 0]} />;
}

const Hero = () => {
  return (
    <>
      <section className="relative flex flex-col items-start justify-center min-h-[40vh] py-12 pl-4 pr-4 md:pl-12 md:pr-12 bg-[#4682A9] rounded-3xl shadow-2xl overflow-hidden mb-12">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={bgvideo1}
          autoPlay
          loop
          muted
          playsInline
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-0" />
        {/* Hero Text & CTA */}
        <motion.div
          className="z-10 w-full max-w-2xl flex flex-col items-start justify-center gap-6 text-left"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-[#8bc8f0] text-xs font-bold tracking-widest shadow">OUR BESTSELLERS</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg">
            Step Into the Future
          </h1>
          <p className="text-white text-lg max-w-md">
            Discover the latest in comfort, style, and innovation. Shop our newest arrivals and experience the next generation of footwear.
          </p>
          <motion.a
            href="/collection"
            className="inline-block px-8 py-3 rounded-full bg-[#8bc8f0] font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300"
            whileHover={{ scale: 1.08 }}
          >
            Shop Now
          </motion.a>
        </motion.div>
      </section>
      {/* 3D Shoe Model Section */}
      <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-black drop-shadow-lg text-center">
            3D Preview Shoes
          </h1>
      <section className="relative flex items-center justify-center w-full py-12 px-4 md:px-0">
        <div className="relative w-full max-w-3xl mx-auto h-[420px] flex items-center justify-center bg-white rounded-3xl border-4 border-black shadow-2xl">
          <Suspense fallback={<div className="flex items-center justify-center h-full w-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4682A9]"></div></div>}>
            <Canvas shadows camera={{ position: [0, 0, 7], fov: 45 }} className="rounded-3xl" style={{ background: 'transparent' }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} />
              <ShoeModel />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
          </Suspense>
          <div className="absolute bottom-4 right-4 bg-surface/80 px-4 py-2 rounded-xl shadow-lg text-xs text-muted backdrop-blur-md">3D Preview (Interactive)</div>
        </div>
      </section>
    </>
  );
};

export default Hero;
