export const riderProfile = {
  id: 5,
  name: "John Mwenda",
  phone: "0711111111",
  city: "Nairobi",
  vehicle: "Motorbike",
  plate: "KDA 123A",
  rating: 4.9,
  totalDeliveries: 487,
};

export const mockJobs = [
  {
    id: "TRP10041",
    status: "assigned", // assigned | picked_up | delivered
    restaurant: {
      name: "Mama's Kitchen",
      address: "Westlands, Nairobi — along Mpaka Road",
      phone: "0712345678",
      coords: { lat: -1.2641, lng: 36.8028 },
    },
    customer: {
      name: "Grace Wambui",
      address: "Sarit Centre, 2nd Floor, Westlands",
      phone: "0798765432",
      coords: { lat: -1.2594, lng: 36.8031 },
    },
    items: [
      { name: "Nyama Choma (500g)", qty: 1, price: 650 },
      { name: "Ugali & Sukuma Wiki", qty: 1, price: 180 },
      { name: "Fresh Passion Juice", qty: 2, price: 120 },
    ],
    orderTotal: 1070,
    deliveryFee: 80,
    payment: "M-Pesa",
    paid: true,
    assignedAt: "12:34",
    eta: "25 min",
    distance: "1.8 km",
  },
  {
    id: "TRP10039",
    status: "assigned",
    restaurant: {
      name: "Mama's Kitchen",
      address: "Westlands, Nairobi — along Mpaka Road",
      phone: "0712345678",
      coords: { lat: -1.2641, lng: 36.8028 },
    },
    customer: {
      name: "Amina Hassan",
      address: "Yaya Centre, Argwings Kodhek Road, Kilimani",
      phone: "0734567890",
      coords: { lat: -1.2897, lng: 36.7894 },
    },
    items: [
      { name: "Githeri Special", qty: 1, price: 220 },
      { name: "Mandazi (3 pcs)", qty: 2, price: 80 },
      { name: "Chai Masala", qty: 2, price: 60 },
    ],
    orderTotal: 500,
    deliveryFee: 80,
    payment: "Cash",
    paid: false,
    assignedAt: "12:18",
    eta: "35 min",
    distance: "3.2 km",
  },
];

export const completedToday = [
  {
    id: "TRP10035",
    customer: "Jane Wanjiku",
    restaurant: "Mama's Kitchen",
    deliveredAt: "11:48",
    deliveryFee: 80,
    distance: "2.1 km",
    payment: "M-Pesa",
  },
  {
    id: "TRP10032",
    customer: "Kevin Njoroge",
    restaurant: "Burger Republic",
    deliveredAt: "10:55",
    deliveryFee: 100,
    distance: "3.4 km",
    payment: "Cash",
  },
  {
    id: "TRP10029",
    customer: "Mercy Kamau",
    restaurant: "Pizza Palace",
    deliveredAt: "10:12",
    deliveryFee: 80,
    distance: "1.9 km",
    payment: "M-Pesa",
  },
];
