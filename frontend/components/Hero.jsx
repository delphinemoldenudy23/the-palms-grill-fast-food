import { motion } from "framer-motion";
import { FaArrowRight, FaUtensils } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-black/75" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/25 via-transparent to-black/50" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/40 backdrop-blur px-5 py-2 rounded-full mb-8"
        >
          <FaUtensils className="text-orange-400" />
          <span className="text-sm tracking-widest uppercase font-medium">
            Best Restaurant In Town
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          The Palm&apos;s Grill
          <span className="block text-orange-400">&amp; Fast Food</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
        >
          View our full menu, order online, request delivery, and enjoy premium local dishes — open daily 1 PM – 3 AM.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a href="#menu" className="btn-primary inline-flex items-center gap-2">
            Order Now <FaArrowRight />
          </a>
          <a href="#menu" className="btn-outline">
            Explore Menu
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#fafafa] to-transparent" />
    </section>
  );
}
