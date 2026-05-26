import {
  FaPhone,
  FaClock,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaTiktok,
  FaFacebook,
  FaSnapchat,
} from "react-icons/fa";

export default function Contact() {
  return (
    <section id="contact" className="py-20 px-4 bg-dark text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Contact &amp; Location</h2>
        <p className="text-center text-gray-400 mb-12">We&apos;re here to serve you — call, chat, or visit</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <FaClock className="text-4xl text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">Open Hours</h3>
            <p className="text-gray-400">Monday – Sunday</p>
            <p className="font-bold text-secondary text-lg">1 PM – 3 AM</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <FaMapMarkerAlt className="text-4xl text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">Location</h3>
            <p>Osu Kuku Hill</p>
            <p className="text-green-400 text-sm mt-1">Delivery Available ✓</p>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <FaPhone className="text-4xl text-primary mx-auto mb-4" />
            <h3 className="font-bold mb-2">Call Us</h3>
            <a href="tel:0551720664" className="block text-secondary font-bold hover:underline">
              0551720664
            </a>
            <a href="tel:0548270547" className="block text-secondary font-bold hover:underline">
              0548270547
            </a>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center">
            <FaWhatsapp className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="font-bold mb-2">WhatsApp</h3>
            <a
              href="https://wa.me/233551720664"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary font-bold hover:underline"
            >
              Chat with us
            </a>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 text-center">Follow Us</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://tiktok.com/@palms.grill.fast"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-primary px-5 py-3 rounded-xl font-bold hover:bg-secondary transition"
            >
              <FaTiktok /> palms.grill.fast
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              <FaFacebook /> palms grill
            </a>
            <a
              href="https://snapchat.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-yellow-400 text-dark px-5 py-3 rounded-xl font-bold hover:bg-yellow-500 transition"
            >
              <FaSnapchat /> palms grill &amp; fast food
            </a>
          </div>
        </div>

        <div className="text-center mt-10">
          <a href="#menu" className="btn-primary inline-block">
            Order Now
          </a>
        </div>
      </div>
    </section>
  );
}
