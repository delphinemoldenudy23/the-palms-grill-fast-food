import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import {
  FaBoxes,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
  FaEdit,
  FaTrash,
} from 'react-icons/fa'

export default function Dashboard() {
  const [stats, setStats] = useState({
    items: 0,
    orders: 0,
    users: 0,
  })

  const [menuItems, setMenuItems] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Rice Dishes',
    priceSmall: '',
    priceLarge: '',
    image: '',
  })

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      router.push('/login')
    } else {
      fetchMenu()
    }
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/menu')
      setMenuItems(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      prices: {
        M: Number(form.priceSmall),
        L: Number(form.priceLarge),
      },
      image: form.image,
      available: true,
    }

    if (editingId) {
      const res = await axios.put(
        `http://localhost:5000/api/menu/${editingId}`,
        payload
      )

      setMenuItems(
        menuItems.map((item) =>
          item._id === editingId ? res.data : item
        )
      )
      setEditingId(null)
    } else {
      const res = await axios.post(
        'http://localhost:5000/api/menu',
        payload
      )
      setMenuItems([...menuItems, res.data])
    }

    setForm({
      name: '',
      description: '',
      category: 'Rice Dishes',
      priceSmall: '',
      priceLarge: '',
      image: '',
    })
  }

  const handleEdit = (item) => {
    setEditingId(item._id)

    setForm({
      name: item.name,
      description: item.description,
      category: item.category,
      priceSmall: item.prices?.M,
      priceLarge: item.prices?.L,
      image: item.image,
    })
  }

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/menu/${id}`)
    setMenuItems(menuItems.filter((item) => item._id !== id))
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Food name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="priceSmall"
          placeholder="Small price"
          value={form.priceSmall}
          onChange={handleChange}
        />

        <input
          name="priceLarge"
          placeholder="Large price"
          value={form.priceLarge}
          onChange={handleChange}
        />

        <button type="submit">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      {/* MENU LIST */}
      <div>
        {menuItems.map((item) => (
          <div key={item._id}>
            <h3>{item.name}</h3>

            <button onClick={() => handleEdit(item)}>
              Edit
            </button>

            <button onClick={() => handleDelete(item._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}