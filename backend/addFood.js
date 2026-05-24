async function addFood() {
  try {
    const res = await fetch("https://the-palms-grill-fast-food.onrender.com/api/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Jollof Rice",
        description: "Spicy Ghanaian jollof rice served with chicken",
        category: "Rice Dishes",
        prices: { Small: 20, Medium: 30, Large: 40 },

        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",

        available: true
      })
    });

    const data = await res.json();
    console.log("SUCCESS:", data);
  } catch (error) {
    console.log("ERROR:", error.message);
  }
}

addFood();