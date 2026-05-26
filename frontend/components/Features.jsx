import { FaPhone, FaClock, FaTruck, FaUtensils } from "react-icons/fa";

const features = [
  {
    icon: <FaUtensils />,
    title: "Premium Local Food",
    description: "Fried rice, yam dishes & BBQ specials made fresh daily",
  },
  {
    icon: <FaTruck />,
    title: "Fast Delivery",
    description: "Delivery available across Osu Kuku Hill and nearby areas",
  },
  {
    icon: <FaClock />,
    title: "Open Late",
    description: "Monday – Sunday, 1 PM – 3 AM",
  },
  {
    icon: <FaPhone />,
    title: "Easy Ordering",
    description: "Order online or chat on WhatsApp — 0551720664",
  },
];

export default function Features() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="section-title">Why Choose Us?</h2>
        <p className="section-sub">Modern ordering, premium taste, served with care</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#fafafa] p-6 rounded-2xl text-center hover:shadow-lg transition border border-gray-100"
            >
              <div className="text-4xl text-primary mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
