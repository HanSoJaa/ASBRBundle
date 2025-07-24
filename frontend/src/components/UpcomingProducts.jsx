import React from 'react';
import { motion } from 'framer-motion';
import video1 from '../assets/shoe 1.mp4';
import video2 from '../assets/shoe 2.mp4';
import video3 from '../assets/shoe 3.mp4';

const upcoming = [
  {
    name: 'Rengoku Nike Flame',
    video: video1,
    desc: 'Collaboration with Demon Slayer'
  },
  {
    name: 'Ultra Sonic Nike',
    video: video2,
    desc: 'Collaboration with Sonic the Hedgehog'
  },
  {
    name: 'Red Titan Nike Boost',
    video: video3,
    desc: 'Collaboration with Attack Of Titan'
  }
];

const cardVariants = {
  offscreen: { opacity: 0, y: 80 },
  onscreen: {
    opacity: 1, y: 0,
    transition: { type: 'spring', bounce: 0.3, duration: 0.8 }
  }
};

const UpcomingProducts = () => (
  <section className="py-16 px-4 max-w-7xl mx-auto">
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-[#4682A9] mb-2">COMING SOON</h2>
      <p className="text-muted text-lg">Get ready for the next big thing in footwear. Preview our soon-to-launch innovations!</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {upcoming.map((item, idx) => (
        <motion.div
          key={item.name}
          className="rounded-3xl overflow-hidden shadow-xl bg-surface/80 backdrop-blur-lg border border-background-dark hover:shadow-2xl transition-shadow group relative"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
          variants={cardVariants}
          whileHover={{ scale: 1.04, borderRadius: '2.5rem', boxShadow: '0 8px 32px 0 rgba(99,102,241,0.25)' }}
        >
          <div className="relative w-full h-64 bg-background-dark flex items-center justify-center">
            <video
              src={item.video}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              autoPlay
              loop
              muted
              playsInline
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background-dark/80 to-transparent p-4">
              <h3 className="text-xl font-bold text-surface drop-shadow-lg">{item.name}</h3>
              <p className="text-muted text-white text-sm">{item.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default UpcomingProducts; 