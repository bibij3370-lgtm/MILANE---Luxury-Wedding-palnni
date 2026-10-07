/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, Search, Calendar, MapPin, Star, ShieldCheck, User, Sparkles, 
  MessageSquare, Bell, Bookmark, DollarSign, CheckCircle2, Clock, 
  SlidersHorizontal, ChevronRight, X, Menu, Plus, Trash2, Edit3, 
  Settings, LogOut, ArrowRight, Building, Camera, Scissors, Gift, 
  Utensils, Flower2, Music, Crown, Check, AlertCircle, Share2, BarChart3, 
  Users, Package, Layers, Box, AlertTriangle, ShoppingCart, Tag, RefreshCw, Zap
} from 'lucide-react';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from './firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, getDocs } from 'firebase/firestore';

// Static category filters for luxury wedding discovery
const CATEGORIES = [
  { id: 'venues', name: 'Venues', icon: Building, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80' },
  { id: 'photography', name: 'Photography', icon: Camera, image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80' },
  { id: 'makeup', name: 'Bridal Makeup', icon: Scissors, image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80' },
  { id: 'decor', name: 'Decor & Styling', icon: Sparkles, image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80' },
  { id: 'catering', name: 'Catering', icon: Utensils, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80' },
  { id: 'florists', name: 'Florists', icon: Flower2, image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80' },
  { id: 'planners', name: 'Wedding Planners', icon: Crown, image: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=600&q=80' },
  { id: 'entertainment', name: 'Entertainment', icon: Music, image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80' },
];

export const WEBSITE_PAGE_CATEGORIES = [
  { id: 'venues', name: 'Venues', icon: 'Building', description: 'Luxury wedding banquets, scenic marquees, palaces, and outdoor lawns.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80' },
  { id: 'photography', name: 'Photography', icon: 'Camera', description: 'Celebrity wedding photographers, cinematic trailers, and drone coverage.', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80' },
  { id: 'makeup', name: 'Bridal Makeup', icon: 'Scissors', description: 'Bridal makeover specialists, HD party makeup, and hair stylists.', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80' },
  { id: 'decor', name: 'Decor & Styling', icon: 'Sparkles', description: 'Thematic stage designs, fairytale fairy lights, and bespoke mandaps.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80' },
  { id: 'catering', name: 'Catering', icon: 'Utensils', description: 'Royal traditional wedding feasts, live BBQ stations, and gourmet desserts.', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80' },
  { id: 'florists', name: 'Florists', icon: 'Flower2', description: 'Imported fresh flowers, fragrant bridal garlands, and floral entryway arcs.', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80' },
  { id: 'planners', name: 'Wedding Planners', icon: 'Crown', description: 'End-to-end luxury wedding planning, concept design, and vendor coordination.', image: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=600&q=80' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Music', description: 'Qawwali nights, live orchestras, acoustic bands, and sound-and-light setups.', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80' },
];

export const DEMO_VENUES = [
  {
    id: 'venue-1',
    name: 'The Nishat Grand Ballroom',
    type: 'Luxury Ballroom',
    location: 'Emporium Complex, Johar Town, Lahore',
    city: 'Lahore',
    capacity: '1,200 Guests',
    price: 450000,
    rating: 4.9,
    reviewsCount: 48,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
    description: 'Iconic crystal chandeliers, bespoke royal bridal suites, valet parking for 500+ cars, and state-of-the-art acoustic sound architecture.',
    amenities: ['Central Air-Conditioning', 'Valet Parking', 'Bridal Suite', 'Full Power Backup', 'In-house Gourmet Catering'],
  },
  {
    id: 'venue-2',
    name: 'Haveli Barood Khana & Mughal Heritage Court',
    type: 'Heritage Haveli',
    location: 'Walled City (Androon Lahore), Lahore',
    city: 'Lahore',
    capacity: '800 Guests',
    price: 650000,
    rating: 5.0,
    reviewsCount: 62,
    image: 'https://images.unsplash.com/photo-1545232979-fbf673c68388?auto=format&fit=crop&w=1000&q=80',
    description: '17th-century authentic Mughal heritage architecture with floodlit historic brick arches, courtyard fountains, and royal Badshahi Mosque vistas.',
    amenities: ['Heritage Ambience', 'Fountain Courtyard', 'Antique Chandeliers', 'Bridal Holding Room', 'Photo-Shoot Permitted'],
  },
  {
    id: 'venue-3',
    name: 'Royal Palm Golf & Country Club',
    type: 'Outdoor Lawns & Marquee',
    location: '52 Canal Bank Road, Lahore',
    city: 'Lahore',
    capacity: '2,000 Guests',
    price: 800000,
    rating: 4.8,
    reviewsCount: 54,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
    description: 'Manicured lakeside fairways, transparent German marquees, and dramatic fireworks approval for royal wedding receptions.',
    amenities: ['Lakeside Views', 'Valet Parking', 'Fireworks Permitted', 'German Imported Marquee', 'Executive Lounge'],
  },
  {
    id: 'venue-4',
    name: 'Serena Sheesh Mahal Hall & Margalla Lawn',
    type: '5-Star Luxury Hotel',
    location: 'Khayaban-e-Suhrawardy, G-5/1, Islamabad',
    city: 'Islamabad',
    capacity: '1,500 Guests',
    price: 900000,
    rating: 4.9,
    reviewsCount: 71,
    image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
    description: 'Opulent Islamic architecture with mirror-mosaic artisanal ceilings, Margalla hill breeze, and multi-cuisine royal banqueting.',
    amenities: ['5-Star Hospitality', 'VVIP Security Access', 'Margalla Hill Backdrop', 'Helipad Access', 'Valet Parking'],
  },
  {
    id: 'venue-5',
    name: 'Pearl Continental Crystal Ballroom',
    type: 'Grand Hotel Ballroom',
    location: 'Club Road, Karachi & Mall Road, Lahore',
    city: 'Karachi / Lahore',
    capacity: '1,000 Guests',
    price: 550000,
    rating: 4.8,
    reviewsCount: 39,
    image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1000&q=80',
    description: 'Timeless luxury with plush carpeted expanses, custom LED ambient mood lighting, and Michelin-trained banquet chefs.',
    amenities: ['Full Catering Setup', 'Elevator Access', 'Dedicated Bridal Suite', '24/7 Power Support', 'Dedicated Event Manager'],
  },
  {
    id: 'venue-6',
    name: 'The Monal Marquee & Hilltop Terrace',
    type: 'Hilltop Scenic Marquee',
    location: 'Pir Sohawa Road, Margalla Hills, Islamabad',
    city: 'Islamabad',
    capacity: '700 Guests',
    price: 420000,
    rating: 4.7,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
    description: 'Perched high in the clouds overlooking the Islamabad valley with crisp pine air and panoramic nighttime city lights.',
    amenities: ['Panoramic City Lights', 'Terrace Deck', 'Bespoke Heaters/Misters', 'Scenic Photography', 'Valet Shuttle'],
  },
];

export const DEMO_INSPIRATIONS = [
  {
    id: 'insp-1',
    title: 'Royal Crimson Velvet Bridal Lehenga',
    category: 'Bridal Couture',
    designer: 'Heritage Atelier Lahore',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
    description: 'Handcrafted zardozi, tilla, and dabka embroideries on pure Italian micro-velvet with double organza dupattas.',
    tags: ['Barat', 'Red Bridal', 'Zardozi', 'Royal Velvet']
  },
  {
    id: 'insp-2',
    title: 'Fairytale Rose & Crystal Chandelier Stage Decor',
    category: 'Stage & Mandap',
    designer: 'Milané Signature Styling',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
    description: 'Over 5,000 Dutch avalanche roses, cascading Venetian crystal chandeliers, and warm candlelight ambiance.',
    tags: ['Walima Stage', 'Chandelier', 'Pastel Decor', 'Grand Stage']
  },
  {
    id: 'insp-3',
    title: 'Marigold & Mustard Festive Mehndi Courtyard',
    category: 'Mehndi Themes',
    designer: 'Zahra Event Crafts',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80',
    description: 'Traditional Punjabi genda phool floral canopies, hand-painted truck art cushions, and fairy lights canopy.',
    tags: ['Mehndi', 'Genda Phool', 'Boho Folk', 'Courtyard']
  },
  {
    id: 'insp-4',
    title: 'Sunset Marble Pavilion Couple Portrait',
    category: 'Cinematic Moments',
    designer: 'Faizan Wedding Cinematography',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=80',
    description: 'Golden hour silhouette photography capturing delicate veil wind movement against Mughal marble arches.',
    tags: ['Golden Hour', 'Couple Shoot', 'Cinematic', 'Bridal Veil']
  },
  {
    id: 'insp-5',
    title: 'Enchanted Forest Floral Entryway Arch',
    category: 'Floral Magic',
    designer: 'The Flora Studio',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
    description: 'Imported hydrangeas, eucalyptus greenery, and baby’s breath forming a fairytale archway for bride & groom entry.',
    tags: ['Floral Arch', 'Entryway', 'Hydrangeas', 'Fairytale']
  },
  {
    id: 'insp-6',
    title: 'Royal Mughal Candlelit Banquet Tablescape',
    category: 'Dining & Catering',
    designer: 'Imperial Table Planners',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
    description: 'Polished silverware, crystal flutes, taper candles in brass candelabras, and hand-embroidered table runners.',
    tags: ['Tablescape', 'Royal Banquet', 'Candlelit', 'Gourmet']
  },
  {
    id: 'insp-7',
    title: 'Pastel Ivory & Blush Pink Nikkah Stage',
    category: 'Stage & Mandap',
    designer: 'Elegance Wedding Decor',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80',
    description: 'Soft chiffon drapes, floating white lotus pool centerpieces, and intimate floor seating for the sacred Nikkah ritual.',
    tags: ['Nikkah', 'Ivory Decor', 'Lotus Pond', 'Minimal Luxury']
  },
  {
    id: 'insp-8',
    title: 'Traditional Polki & Colombian Emerald Jewels',
    category: 'Bridal Couture',
    designer: 'Royal Gems & Heritage Jewelers',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80',
    description: '22k gold uncut diamond polki choker, matching jhumkas, and teardrop emerald maang tikka with fine meenakari.',
    tags: ['Jewellery', 'Polki Diamonds', 'Emeralds', 'Bridal Set']
  },
  {
    id: 'insp-9',
    title: 'Sufi Qawwali Night Lounge Setup',
    category: 'Mehndi Themes',
    designer: 'Rung Event Designers',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80',
    description: 'Plush velvet deewans, Persian kilim rugs, antique hurricane lanterns, and live stage for Ustad Nusrat tributes.',
    tags: ['Qawwali Night', 'Persian Rugs', 'Lanterns', 'Musical Evening']
  },
];

export const DEMO_PACKAGES = [
  {
    id: 'pkg-1',
    name: 'The Royal Barat Grand Experience',
    badge: 'Most Popular',
    price: 850000,
    guestCount: 'Up to 600 Guests',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    description: 'Complete luxury wedding package including grand ballroom booking, thematic 40ft stage, 5-course royal menu, and cinematic multi-camera drone coverage.',
    inclusions: [
      'Ballroom reservation with crystal chandeliers',
      'Thematic fresh floral stage & royal bride/groom couch',
      'Mutton Qorma, Biryani & Gourmet Dessert Buffet',
      '3-person cinematic photo & drone film crew',
      'Valet parking & dedicated bridal manager'
    ]
  },
  {
    id: 'pkg-2',
    name: 'Intimate Heritage Nikkah Package',
    badge: 'Artisanal Luxury',
    price: 420000,
    guestCount: 'Up to 250 Guests',
    image: 'https://images.unsplash.com/photo-1545232979-fbf673c68388?auto=format&fit=crop&w=800&q=80',
    description: 'Romantic courtyards or boutique ballroom with pastel floral mandap, acoustic live music, artisanal tea bar, and fine art portraits.',
    inclusions: [
      'Historic courtyard / boutique hall setup',
      'Blush pink & ivory fresh flower Nikkah canopy',
      'Traditional Kashmiri chai & royal finger food bar',
      'Fine-art portrait photographer (full day)',
      'Customized calligraphic Nikkahnama display'
    ]
  },
  {
    id: 'pkg-3',
    name: 'The Empress 3-Day Complete Wedding',
    badge: 'All-Inclusive Sovereign',
    price: 1650000,
    guestCount: '3 Full Events (Mehndi, Barat, Walima)',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    description: 'End-to-end luxury management covering all 3 major celebrations, celebrity makeup booking, sound & light engineering, and personal concierge.',
    inclusions: [
      '3 premier venue reservations across 3 nights',
      '3 unique theme decors (Folk Mehndi, Royal Barat, Modern Walima)',
      'Complete catering feasts for all three celebrations',
      'Director-level wedding cinematic feature film',
      'Dedicated day-of-event wedding director & security'
    ]
  }
];

export const DEMO_PRODUCTS = [
  {
    id: 'prod_grand_palace',
    name: 'Royal Heritage Grand Ballroom & Banquet',
    category: 'Venues',
    price: 850000,
    status: 'Active',
    description: 'Capacity for up to 1,200 guests with Swarovski chandeliers, VIP bridal suite, and dedicated valet parking.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Royal Palm Heritage & Golf Resort'
  },
  {
    id: 'prod_marq_open_air',
    name: 'Sunset Lawn & Glass Marquee Setup',
    category: 'Venues',
    price: 450000,
    status: 'Active',
    description: 'Air-conditioned luxury glass marquee setup in landscaped botanical garden with panoramic fairy light walkways.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Mughal Lawns & Banquets'
  },
  {
    id: 'prod_cinematic_photo',
    name: 'Cinematic 4K Wedding Story & Drone Coverage',
    category: 'Photography',
    price: 280000,
    status: 'Active',
    description: 'Complete 3-day multi-camera 4K cinematography, drone aerials, candid portraiture, and luxury velvet photobook.',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Lumière Wedding Cinematography'
  },
  {
    id: 'prod_studio_portraits',
    name: 'Signature Bridal & Groom Editorial Shoot',
    category: 'Photography',
    price: 150000,
    status: 'Active',
    description: 'High-fashion editorial lighting setup, professional styling guidance, 100 retouched digital masters.',
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Irfan Ahson Studio'
  },
  {
    id: 'prod_bridal_regal',
    name: 'Royal Heritage Barat & Walima Makeover',
    category: 'Bridal Makeup',
    price: 125000,
    status: 'Active',
    description: 'Master bridal stylist HD airbrush makeup, luxury lash application, jewelry setting, dupatta draping, and hair styling.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Nabila Luxury Salon'
  },
  {
    id: 'prod_mehndi_glow',
    name: 'Sun-Kissed Mehndi & Sangeet Glam',
    category: 'Bridal Makeup',
    price: 65000,
    status: 'Active',
    description: 'Dewy radiant festive makeup with floral hair art and organic herbal skincare prep.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Natasha Salon Studio'
  },
  {
    id: 'prod_floral_mandap',
    name: 'Fresh Imported Floral Stage & Mandap Concept',
    category: 'Decor & Styling',
    price: 350000,
    status: 'Active',
    description: 'Handcrafted floral arches with imported Dutch roses, cascading hydrangeas, mood lighting, and mirror aisle walkway.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    vendorName: 'QYT Events & Design'
  },
  {
    id: 'prod_mughal_buffet',
    name: 'Royal Mughlai & Continental 7-Course Feast',
    category: 'Catering',
    price: 420000,
    status: 'Active',
    description: 'Signature Dum Biryani, Mutton Kunna, Live Seekh Kebab counter, Seafood station, Belgian Chocolate fountains.',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Kitchen Cuisine & Catering'
  },
  {
    id: 'prod_qawwali_troupe',
    name: 'Live Sufi Qawwali Night & Sound Stage',
    category: 'Entertainment',
    price: 220000,
    status: 'Active',
    description: '8-piece traditional Sufi qawwali ensemble with live acoustic harmonium, tabla, and concert line-array sound system.',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Niazi Sufi Ensemble'
  },
  {
    id: 'prod_full_planner',
    name: 'Full-Scale 360° Luxury Wedding Planning & Coordination',
    category: 'Wedding Planners',
    price: 500000,
    status: 'Active',
    description: 'Complete end-to-end management covering RSVP tracking, vendor contracts, timeline execution, and on-ground floor directors.',
    image: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80',
    vendorName: 'Mise En Scène Events'
  }
];

export const PRODUCT_DEMO_IMAGES = [
  {
    category: 'Venues',
    title: 'Grand Ballroom',
    url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Venues',
    title: 'Glass Marquee',
    url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Venues',
    title: 'Sunset Garden Lawn',
    url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec09?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Photography',
    title: 'Cinematography & Drone',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Photography',
    title: 'Bridal Portraiture',
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Bridal Makeup',
    title: 'Royal Barat Glam',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Bridal Makeup',
    title: 'Mehndi & Sangeet Dew',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Decor & Styling',
    title: 'Floral Mandap Stage',
    url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Decor & Styling',
    title: 'Crystal Chandeliers',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Catering',
    title: 'Royal Mughlai Buffet',
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Florists',
    title: 'Rose Canopy Aisle',
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Entertainment',
    title: 'Sufi Qawwali Stage',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Wedding Planners',
    title: 'Master Event Suite',
    url: 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    category: 'Invitations',
    title: 'Velvet Gold Card Box',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80'
  }
];

const getCategoryIcon = (nameOrId: string) => {
  const lower = (nameOrId || '').toLowerCase();
  if (lower.includes('venue') || lower.includes('hall')) return Building;
  if (lower.includes('photo') || lower.includes('camera')) return Camera;
  if (lower.includes('makeup') || lower.includes('scissors') || lower.includes('salon')) return Scissors;
  if (lower.includes('decor') || lower.includes('styling') || lower.includes('sparkle')) return Sparkles;
  if (lower.includes('cater') || lower.includes('food') || lower.includes('utensil')) return Utensils;
  if (lower.includes('flor') || lower.includes('flower')) return Flower2;
  if (lower.includes('plan') || lower.includes('crown')) return Crown;
  if (lower.includes('music') || lower.includes('entertain') || lower.includes('song')) return Music;
  return Layers;
};

export default function App() {
  // Current user & authentication state (with persistent session storage)
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('milane_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userRole, setUserRole] = useState<'customer' | 'vendor' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('milane_auth_role');
      return (saved as any) || 'customer';
    } catch {
      return 'customer';
    }
  });
  const [activePortal, setActivePortal] = useState<'public' | 'customer' | 'vendor' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('milane_active_portal');
      return (saved as any) || 'public';
    } catch {
      return 'public';
    }
  });

  // Sync activePortal to localStorage whenever changed
  useEffect(() => {
    if (activePortal) {
      localStorage.setItem('milane_active_portal', activePortal);
    }
  }, [activePortal]);
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'vendors' | 'vendor-profile' | 'venues' | 'inspiration' | 'packages' | 'about'>('home');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Admin Portal Navigation State (Original Clean Portal Structure)
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'categories' | 'vendors' | 'orders' | 'users' | 'settings'>('dashboard');

  // Auth Modal State & Mobile Menu State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // REAL-TIME FIRESTORE DATA STATES (Completely clean - 0 demo data)
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // DEFAULT STORE SETTINGS (Persistent & Real-time synced)
  const DEFAULT_SETTINGS = {
    platformName: 'MILANÉ Luxury Wedding Platform',
    tagline: "Pakistan's Premier Luxury Wedding Experience",
    adminEmail: 'bibij3370@gmail.com',
    supportPhone: '+92 300 1234567',
    currency: 'PKR',
    city: 'Lahore, Pakistan',
    address: 'Gulberg III, Lahore, Punjab, Pakistan',
    commissionRate: 10,
    bookingDepositPercent: 25,
    cancellationDays: 14,
    orderNotifications: true,
    vendorApprovalRequired: true,
    maintenanceMode: false,
  };

  const [storeSettings, setStoreSettings] = useState<typeof DEFAULT_SETTINGS>(() => {
    try {
      const cached = localStorage.getItem('milane_store_settings');
      if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
    } catch {}
    return DEFAULT_SETTINGS;
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Modals for real-time adding
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: 'Layers', image: '' });
  const [selectedInspirationImage, setSelectedInspirationImage] = useState<any>(null);
  const [venueCategoryFilter, setVenueCategoryFilter] = useState('All');
  const [inspirationCategoryFilter, setInspirationCategoryFilter] = useState('All');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Venues', price: 100000, description: '', image: '', vendorName: '' });

  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ businessName: '', category: 'Venues', location: '', startingPrice: 150000, coverImage: '', description: '' });

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPackage, setBookingPackage] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSortOrder, setProductSortOrder] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  });

  // User Personalization States (Real data)
  const [weddingDate, setWeddingDate] = useState(() => {
    return localStorage.getItem('milane_wedding_date') || '';
  });
  const [editingWeddingDate, setEditingWeddingDate] = useState(false);
  const [editingCoupleName, setEditingCoupleName] = useState(false);
  const [coupleNameInput, setCoupleNameInput] = useState('');

  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'Venues', amount: 0, notes: '' });

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '' });

  // REAL-TIME FIRESTORE SYNCHRONIZATION VIA onSnapshot
  useEffect(() => {
    // 1. Real-time Products Listener (with auto-sync of demo products if empty on launch)
    const unsubProducts = onSnapshot(collection(db, 'products'), async (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const hasSeededProducts = localStorage.getItem('milane_products_seeded');
      if (items.length === 0 && !hasSeededProducts) {
        localStorage.setItem('milane_products_seeded', 'true');
        try {
          for (const prod of DEMO_PRODUCTS) {
            await setDoc(doc(db, 'products', prod.id), {
              name: prod.name,
              category: prod.category,
              price: Number(prod.price),
              status: prod.status || 'Active',
              description: prod.description || '',
              image: prod.image || '',
              vendorName: prod.vendorName || '',
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (e) {
          console.error("Error auto-seeding products:", e);
        }
      }
      setAdminProducts(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    // 2. Real-time Orders Listener
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // 3. Real-time Users Listener with Deduplication & Auto-Cleanup of Duplicates
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const rawDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const uniqueMap = new Map<string, any>();
      const duplicateDocIds: string[] = [];

      rawDocs.forEach(u => {
        const emailKey = (u.email || '').toLowerCase().trim();
        if (emailKey) {
          if (uniqueMap.has(emailKey)) {
            // Document is a duplicate from repeated logins
            duplicateDocIds.push(u.id);
          } else {
            uniqueMap.set(emailKey, u);
          }
        } else {
          uniqueMap.set(u.id, u);
        }
      });

      setUsersList(Array.from(uniqueMap.values()));

      // Automatically clean up duplicate documents from repeated logins
      if (duplicateDocIds.length > 0) {
        duplicateDocIds.forEach(dupId => {
          deleteDoc(doc(db, 'users', dupId)).catch((err) => {
            console.warn('Auto cleanup duplicate user:', err);
          });
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    // 4. Real-time Vendors Listener
    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vendors');
    });

    // 5. Real-time Budget Listener
    const unsubBudget = onSnapshot(collection(db, 'budget'), (snapshot) => {
      setBudgetItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budget');
    });

    // 6. Real-time Tasks Listener
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    // 7. Real-time Categories Listener (Clean real-time synchronization)
    const unsubCategories = onSnapshot(collection(db, 'categories'), async (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const hasSeededBefore = localStorage.getItem('milane_categories_seeded');
      if (items.length === 0 && !hasSeededBefore) {
        // Only seed once on initial platform launch if no categories have ever been loaded
        localStorage.setItem('milane_categories_seeded', 'true');
        try {
          for (const cat of WEBSITE_PAGE_CATEGORIES) {
            const docId = `cat_${cat.id}`;
            await setDoc(doc(db, 'categories', docId), {
              name: cat.name,
              description: cat.description,
              icon: cat.id,
              image: cat.image,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (e) {
          console.warn('Auto seed categories error:', e);
        }
      } else {
        setCategoriesList(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    // 8. Real-time Store Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() as Partial<typeof DEFAULT_SETTINGS>;
        setStoreSettings((prev: typeof DEFAULT_SETTINGS) => {
          const merged = { ...prev, ...remoteData };
          try {
            localStorage.setItem('milane_store_settings', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }, (error) => {
      console.warn('Settings load:', error);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
      unsubVendors();
      unsubBudget();
      unsubTasks();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  // REAL-TIME ACTIONS (FIRESTORE MUTATIONS) - ULTRA-FAST INSTANT SIGN-IN (<100ms)
  const handleAuthSubmit = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    const email = (directEmail !== undefined ? directEmail : authEmail).trim().toLowerCase();
    const password = directPassword !== undefined ? directPassword : authPassword;
    
    // Strict Admin check: Only if email is admin AND password is tayyaba009
    const isAdminEmail = email === 'tk304105@gamil.com' || email === 'tk304105@gmail.com' || email === 'bibij3370@gmail.com';
    const isAdminPassword = password === 'tayyaba009';

    let role: 'customer' | 'vendor' | 'admin' = 'customer';
    if (isAdminEmail && isAdminPassword) {
      role = 'admin';
    } else {
      role = 'customer';
    }

    const normalizedEmail = email || 'client@milane.pk';
    const emailPrefix = normalizedEmail.split('@')[0] || 'User';
    const cleanCustomerName = emailPrefix
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Wedding Client';
    const name = role === 'admin' ? 'Admin Controller' : cleanCustomerName;
    // Deterministic user ID based on email to ensure repeated logins never create duplicate records
    const sanitizedEmail = normalizedEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
    const userDocId = `user_${sanitizedEmail}`;

    const userData = {
      uid: userDocId,
      displayName: name,
      email: normalizedEmail,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      role,
      lastLogin: new Date().toISOString()
    };

    const nextPortal = role === 'admin' ? 'admin' : 'customer';

    // 1. INSTANT STATE & PERSISTENCE UPDATE (Zero latency, immediate UI switch)
    setCurrentUser(userData);
    setUserRole(role);
    setActivePortal(nextPortal);
    setShowAuthModal(false);
    setAuthEmail('');
    setAuthPassword('');

    try {
      localStorage.setItem('milane_auth_user', JSON.stringify(userData));
      localStorage.setItem('milane_auth_role', role);
      localStorage.setItem('milane_active_portal', nextPortal);
    } catch (e) {
      console.warn('Storage save error:', e);
    }

    // 2. BACKGROUND FIRESTORE SYNC (Asynchronous non-blocking write so user is not delayed)
    setDoc(doc(db, 'users', userDocId), {
      uid: userDocId,
      name,
      email: userData.email,
      role,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true }).catch(err => {
      console.warn('User profile background sync:', err);
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole('customer');
    setActivePortal('public');
    try {
      localStorage.removeItem('milane_auth_user');
      localStorage.removeItem('milane_auth_role');
      localStorage.removeItem('milane_active_portal');
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
  };

  // Delete User from Firestore
  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }
  };

  // Add Category to Firestore
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategory.name.trim(),
        description: newCategory.description || 'Exclusive luxury wedding service category',
        icon: newCategory.icon || 'Layers',
        image: newCategory.image.trim() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        createdAt: new Date().toISOString()
      });
      setShowAddCategoryModal(false);
      setNewCategory({ name: '', description: '', icon: 'Layers', image: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  // Delete Category from Firestore & Website (Real-time removal)
  const handleDeleteCategory = async (id: string, catName?: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));

      // If the currently filtered category on website is this category, reset filter to 'All'
      if (catName && selectedCategoryFilter.toLowerCase() === catName.toLowerCase()) {
        setSelectedCategoryFilter('All');
      }

      // Also clean up any products under this deleted category so they disappear from the website catalog
      if (catName) {
        const matchingProducts = adminProducts.filter(p => (p.category || '').toLowerCase() === catName.toLowerCase());
        for (const prod of matchingProducts) {
          if (prod.id) {
            try {
              await deleteDoc(doc(db, 'products', prod.id));
            } catch (err) {
              console.warn('Error deleting associated product:', err);
            }
          }
        }

        // Also clean up any vendors under this deleted category so they disappear from the website directory
        const matchingVendors = vendors.filter(v => (v.category || '').toLowerCase() === catName.toLowerCase());
        for (const ven of matchingVendors) {
          if (ven.id) {
            try {
              await deleteDoc(doc(db, 'vendors', ven.id));
            } catch (err) {
              console.warn('Error deleting associated vendor:', err);
            }
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  // Seed / Sync All 8 Website Page Categories to Firestore
  const seedWebsiteCategories = async () => {
    try {
      localStorage.setItem('milane_categories_seeded', 'true');
      for (const cat of WEBSITE_PAGE_CATEGORIES) {
        const docId = `cat_${cat.id}`;
        await setDoc(doc(db, 'categories', docId), {
          name: cat.name,
          description: cat.description,
          icon: cat.id,
          image: cat.image,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'categories');
    }
  };

  // Seed / Sync Curated Demo Products & Services into Firestore
  const seedDemoProducts = async () => {
    try {
      localStorage.setItem('milane_products_seeded', 'true');
      for (const prod of DEMO_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), {
          name: prod.name,
          category: prod.category,
          price: Number(prod.price),
          status: prod.status || 'Active',
          description: prod.description || '',
          image: prod.image || '',
          vendorName: prod.vendorName || '',
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  // Save Store Settings in Real-Time to Firestore & localStorage
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = {
        ...storeSettings,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'settings', 'general'), updated, { merge: true });
      try {
        localStorage.setItem('milane_store_settings', JSON.stringify(updated));
      } catch {}
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3500);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    } finally {
      setSavingSettings(false);
    }
  };

  // Reset Store Settings to Default
  const handleResetStoreSettings = async () => {
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), DEFAULT_SETTINGS, { merge: true });
      setStoreSettings(DEFAULT_SETTINGS);
      try {
        localStorage.setItem('milane_store_settings', JSON.stringify(DEFAULT_SETTINGS));
      } catch {}
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3500);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/general');
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Product to Firestore
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return;
    try {
      await addDoc(collection(db, 'products'), {
        name: newProduct.name,
        category: newProduct.category || (categoriesList[0]?.name || 'Venues'),
        price: Number(newProduct.price),
        description: newProduct.description || '',
        image: newProduct.image || '',
        vendorName: newProduct.vendorName || '',
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      setShowAddProductModal(false);
      setNewProduct({ name: '', category: 'Venues', price: 100000, description: '', image: '', vendorName: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  // Delete Product from Firestore
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  // Add Vendor to Firestore
  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.businessName) return;
    try {
      await addDoc(collection(db, 'vendors'), {
        businessName: newVendor.businessName,
        category: newVendor.category,
        location: newVendor.location || 'Lahore, Pakistan',
        startingPrice: Number(newVendor.startingPrice) || 150000,
        rating: 5.0,
        reviewsCount: 1,
        verified: true,
        coverImage: newVendor.coverImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
        description: newVendor.description || 'Premier luxury wedding services.',
        packages: [
          { name: 'Celebration Package', price: Number(newVendor.startingPrice) || 150000, details: 'Complete bespoke service execution.' }
        ]
      });
      setShowAddVendorModal(false);
      setNewVendor({ businessName: '', category: 'Venues', location: '', startingPrice: 150000, coverImage: '', description: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'vendors');
    }
  };

  // Delete Vendor from Firestore
  const handleDeleteVendor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vendors', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `vendors/${id}`);
    }
  };

  // Delete Order / Booking from Firestore
  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
    }
  };

  // Update Order Status in Firestore
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${id}`);
    }
  };

  // Add Booking / Order to Firestore
  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceName = bookingPackage 
        ? bookingPackage.name 
        : (selectedProduct ? selectedProduct.name : (selectedVendor?.businessName || 'Luxury Wedding Service'));
      const price = bookingPackage 
        ? Number(bookingPackage.price) 
        : (selectedProduct ? Number(selectedProduct.price) : (Number(selectedVendor?.startingPrice) || 150000));
      const vendorName = bookingPackage 
        ? 'MILANÉ Curated Package' 
        : (selectedProduct?.vendorName || selectedVendor?.businessName || 'MILANÉ Partner');

      await addDoc(collection(db, 'orders'), {
        customerName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Wedding Client',
        customerEmail: currentUser?.email || 'client@milane.pk',
        serviceName,
        vendorName,
        price,
        date: bookingDate,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        createdAt: new Date().toISOString()
      });

      if (!weddingDate && bookingDate) {
        setWeddingDate(bookingDate);
        try {
          localStorage.setItem('milane_wedding_date', bookingDate);
        } catch {}
      }

      setShowBookingModal(false);
      setBookingPackage(null);
      setSelectedProduct(null);
      alert('Your booking has been confirmed and updated in real-time!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    }
  };

  // Add Budget Expense to Firestore
  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'budget'), {
        category: newExpense.category,
        amount: Number(newExpense.amount) || 0,
        notes: newExpense.notes || 'Wedding expense item',
        paid: false,
        createdAt: new Date().toISOString()
      });
      setShowNewExpenseModal(false);
      setNewExpense({ category: 'Venues', amount: 0, notes: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'budget');
    }
  };

  // Delete Budget Expense from Firestore
  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'budget', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `budget/${id}`);
    }
  };

  // Toggle Budget Expense Paid Status
  const toggleExpensePaid = async (id: string, currentPaid: boolean) => {
    try {
      await updateDoc(doc(db, 'budget', id), { paid: !currentPaid });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `budget/${id}`);
    }
  };

  // Add Task in Wedding Checklist
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTask.title,
        dueDate: newTask.dueDate || '',
        status: 'To Do',
        createdAt: new Date().toISOString()
      });
      setShowNewTaskModal(false);
      setNewTask({ title: '', dueDate: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  // Delete Task from Firestore
  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  // Delete/Cancel Order from Firestore
  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
    }
  };

  // Save Real-time Wedding Date
  const handleSaveWeddingDate = async (newDate: string) => {
    setWeddingDate(newDate);
    try {
      localStorage.setItem('milane_wedding_date', newDate);
      if (currentUser?.uid) {
        await updateDoc(doc(db, 'users', currentUser.uid), { weddingDate: newDate });
      }
    } catch (e) {
      console.warn('Save wedding date error:', e);
    }
    setEditingWeddingDate(false);
  };

  // Save Real-time Couple Display Name
  const handleSaveCoupleName = async (newName: string) => {
    if (!newName.trim()) return;
    const updated = { ...currentUser, displayName: newName.trim() };
    setCurrentUser(updated);
    try {
      localStorage.setItem('milane_auth_user', JSON.stringify(updated));
      if (currentUser?.uid) {
        await updateDoc(doc(db, 'users', currentUser.uid), { name: newName.trim(), displayName: newName.trim() });
      }
    } catch (e) {
      console.warn('Save couple name error:', e);
    }
    setEditingCoupleName(false);
  };

  // Toggle Task Status
  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'Completed' ? 'To Do' : 'Completed';
      await updateDoc(doc(db, 'tasks', id), { status: nextStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  // DYNAMIC CALCULATED DASHBOARD METRICS (Real-time from Firestore)
  const grossRevenue = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;

  // Dynamic currency price formatter
  const formatPrice = (amount: number | string) => {
    const num = Number(amount) || 0;
    return `${storeSettings.currency || 'PKR'} ${num.toLocaleString()}`;
  };

  const totalBudgetSpent = budgetItems.filter(i => i.paid).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalBudgetPlanned = budgetItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292526] flex flex-col font-sans">
      
      {/* MAINTENANCE MODE NOTICE */}
      {storeSettings.maintenanceMode && userRole !== 'admin' && (
        <div className="bg-[#63383A] text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
          Notice: {storeSettings.platformName} is undergoing scheduled maintenance. Browse mode is active.
        </div>
      )}

      {/* TOP LUXURY HEADER */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E4DAD2] px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="cursor-pointer flex items-center gap-3" onClick={() => { if (userRole !== 'admin') { setActivePortal('public'); setCurrentView('home'); } setMobileMenuOpen(false); }}>
            <div className="w-10 h-10 rounded-full bg-[#63383A] text-white flex items-center justify-center font-serif text-xl font-bold tracking-widest shadow-md">
              {storeSettings.platformName ? storeSettings.platformName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <span className="font-serif text-2xl tracking-widest text-[#63383A] font-bold block leading-none">
                {storeSettings.platformName ? storeSettings.platformName.split(' ')[0] : 'MILANÉ'}
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#9A6665] uppercase block mt-1">
                {storeSettings.tagline || 'Your Dream Wedding, Together'}
              </span>
            </div>
          </div>

          {userRole !== 'admin' && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#756C69]">
              <button onClick={() => { setActivePortal('public'); setCurrentView('home'); }} className={`hover:text-[#63383A] transition ${currentView === 'home' && activePortal === 'public' ? 'text-[#63383A] font-semibold border-b-2 border-[#63383A] pb-1' : ''}`}>Home</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('products'); }} className={`hover:text-[#63383A] transition ${currentView === 'products' ? 'text-[#63383A] font-semibold border-b-2 border-[#63383A] pb-1' : ''}`}>
                Products & Services
                {adminProducts.length > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-[#63383A]/10 text-[#63383A] rounded-full font-bold">
                    {adminProducts.length}
                  </span>
                )}
              </button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('vendors'); }} className={`hover:text-[#63383A] transition ${currentView === 'vendors' ? 'text-[#63383A] font-semibold border-b-2 border-[#63383A] pb-1' : ''}`}>Find Vendors</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('venues'); }} className={`hover:text-[#63383A] transition ${currentView === 'venues' ? 'text-[#63383A] font-semibold border-b-2 border-[#63383A] pb-1' : ''}`}>Venues</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('inspiration'); }} className={`hover:text-[#63383A] transition ${currentView === 'inspiration' ? 'text-[#63383A] font-semibold border-b-2 border-[#63383A] pb-1' : ''}`}>Inspiration</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('packages'); }} className={`hover:text-[#63383A] transition ${currentView === 'packages' ? 'text-[#63383A] font-semibold border-b-2 border-[#63383A] pb-1' : ''}`}>Packages</button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {userRole === 'customer' && (
                  <button 
                    onClick={() => setActivePortal(activePortal === 'customer' ? 'public' : 'customer')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition uppercase ${activePortal === 'customer' ? 'bg-[#63383A] text-white' : 'bg-[#F3EDE5] text-[#63383A] hover:bg-[#E4DAD2]'}`}
                  >
                    Customer Portal (User Face)
                  </button>
                )}

                {userRole === 'admin' && (
                  <button 
                    onClick={() => setActivePortal('admin')}
                    className="px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition uppercase bg-[#63383A] text-white"
                  >
                    Admin Portal (Admin Face)
                  </button>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-[#E4DAD2]">
                  <img src={currentUser.photoURL} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-[#B88A5A]" />
                  <button onClick={handleLogout} title="Logout" className="text-[#756C69] hover:text-[#63383A]">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 bg-[#63383A] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow-md"
              >
                <User className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#292526] hover:text-[#63383A]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E4DAD2] px-6 py-6 space-y-4 shadow-xl z-40">
          {userRole !== 'admin' && (
            <nav className="flex flex-col space-y-3 font-medium text-sm text-[#756C69]">
              <button onClick={() => { setActivePortal('public'); setCurrentView('home'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#63383A]">Home</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('products'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#63383A] flex items-center justify-between">
                <span>Products & Services</span>
                {adminProducts.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] bg-[#63383A]/10 text-[#63383A] rounded-full font-bold">
                    {adminProducts.length}
                  </span>
                )}
              </button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('vendors'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#63383A]">Find Vendors</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('venues'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#63383A]">Venues</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('inspiration'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#63383A]">Inspiration</button>
              <button onClick={() => { setActivePortal('public'); setCurrentView('packages'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#63383A]">Packages</button>
            </nav>
          )}

          <div className="pt-4 border-t border-[#E4DAD2] flex flex-col gap-3">
            {currentUser ? (
              <>
                {userRole === 'customer' && (
                  <button 
                    onClick={() => { setActivePortal(activePortal === 'customer' ? 'public' : 'customer'); setMobileMenuOpen(false); }}
                    className="w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#63383A] text-white"
                  >
                    Customer Portal (User Face)
                  </button>
                )}
                {userRole === 'admin' && (
                  <button 
                    onClick={() => { setActivePortal('admin'); setMobileMenuOpen(false); }}
                    className="w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#63383A] text-white"
                  >
                    Admin Portal (Admin Face)
                  </button>
                )}
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#F3EDE5] text-[#63383A]"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest shadow"
              >
                <User className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* SINGLE SIGN IN MODAL - CLEAN & FAST */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E4DAD2] shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowAuthModal(false)} 
              className="absolute top-6 right-6 text-[#756C69] hover:text-[#292526] p-1 rounded-full hover:bg-[#FAF7F2] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#63383A] text-white flex items-center justify-center font-serif text-xl font-bold mx-auto mb-2 shadow-md">
                M
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#292526]">
                Sign In
              </h3>
              <p className="text-xs text-[#756C69] mt-1">Enter your Gmail & password to continue</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Gmail / Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="Enter your Gmail address" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="Enter your password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#63383A] text-white py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow-lg mt-2"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. PUBLIC WEBSITE (Only if userRole !== admin) */}
      {activePortal === 'public' && userRole !== 'admin' && (
        <main className="flex-1">
          {/* HERO SECTION */}
          {currentView === 'home' && (
            <div>
              <section className="relative px-6 lg:px-16 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-b from-[#F3EDE5] to-[#FAF7F2]">
                <div className="flex-1 space-y-6 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E4DAD2] text-xs font-semibold uppercase tracking-widest text-[#9A6665]">
                    <Sparkles className="w-3.5 h-3.5 text-[#B88A5A]" /> Pakistan's Premier Luxury Wedding Platform
                  </div>
                  <h1 className="font-serif text-5xl lg:text-7xl font-bold text-[#292526] leading-tight">
                    Your Dream Wedding, <span className="text-[#63383A] italic">Together.</span>
                  </h1>
                  <p className="text-lg text-[#756C69] font-normal leading-relaxed">
                    Discover trusted wedding professionals, breathtaking venues, bridal ateliers, and complete wedding planning tools crafted for unforgettable celebrations.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button 
                      onClick={() => setCurrentView('vendors')}
                      className="bg-[#63383A] text-white px-8 py-4 rounded-full font-semibold text-xs uppercase tracking-widest hover:bg-[#9A6665] transition shadow-lg flex items-center gap-2"
                    >
                      Explore Wedding Services <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setShowAddVendorModal(true)}
                      className="bg-transparent border border-[#63383A] text-[#63383A] px-8 py-4 rounded-full font-semibold text-xs uppercase tracking-widest hover:bg-[#63383A] hover:text-white transition"
                    >
                      List Your Business
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full max-w-lg">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <img 
                      src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" 
                      alt="Luxury Wedding Setup" 
                      className="w-full h-96 lg:h-[450px] object-cover hover:scale-105 transition duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                      <span className="text-xs uppercase tracking-widest text-[#B88A5A] font-semibold">Real-Time Platform</span>
                      <h3 className="font-serif text-2xl font-bold mt-1">Live Database Synchronized</h3>
                    </div>
                  </div>
                </div>
              </section>

              {/* BROWSE CATEGORIES (REAL-TIME FROM DATABASE) */}
              <section className="px-6 lg:px-16 py-20 bg-white">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Curated Collections</span>
                  <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#292526] mt-2">Browse Wedding Categories</h2>
                  <p className="text-xs text-[#756C69] mt-2">Live wedding services directory synchronized in real-time with the admin portal.</p>
                </div>

                {categoriesList.length === 0 ? (
                  <div className="bg-[#FAF7F2] rounded-3xl p-12 text-center border border-[#E4DAD2] max-w-md mx-auto">
                    <Layers className="w-12 h-12 text-[#B88A5A] mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-bold text-[#292526]">No Categories Found</h3>
                    <p className="text-xs text-[#756C69] mt-1">All categories have been removed or not yet added in the admin portal.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categoriesList.map((cat) => {
                      const CatIcon = getCategoryIcon(cat.name || cat.icon || '');
                      const catImage = cat.image || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => {
                            setSelectedCategoryFilter(cat.name);
                            setCurrentView('vendors');
                          }}
                          className="group relative rounded-2xl overflow-hidden shadow cursor-pointer border border-[#E4DAD2] aspect-square flex flex-col justify-end p-6 hover:shadow-xl transition"
                        >
                          <img src={catImage} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-75" />
                          <div className="relative z-10 text-white">
                            <CatIcon className="w-6 h-6 mb-2 text-[#B88A5A]" />
                            <h3 className="font-serif text-xl font-bold">{cat.name}</h3>
                            <span className="text-xs text-white/80 group-hover:underline flex items-center gap-1 mt-1">
                              Browse listings →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* FEATURED PRODUCTS & SERVICES (REAL-TIME FROM DATABASE) */}
              <section className="px-6 lg:px-16 py-20 bg-[#FAF7F2] border-t border-[#E4DAD2]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Curated Catalog</span>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#292526] mt-2">Products & Services</h2>
                    <p className="text-xs text-[#756C69] mt-2 max-w-xl">
                      Real-time luxury packages, grand ballrooms, 4K cinematography, bridal makeovers, and royal banquet feasts.
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentView('products')}
                    className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
                  >
                    View All Products ({adminProducts.length}) <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {adminProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-[#E4DAD2] max-w-md mx-auto">
                    <Package className="w-12 h-12 text-[#B88A5A] mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-bold text-[#292526]">No Products Available</h3>
                    <p className="text-xs text-[#756C69] mt-1 mb-4">Catalog products will appear here in real-time as added by the administration.</p>
                    <button 
                      onClick={seedDemoProducts}
                      className="bg-[#63383A] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                    >
                      ✨ Load Demo Products
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {adminProducts.slice(0, 8).map((p) => {
                      const IconComp = getCategoryIcon(p.category || '');
                      return (
                        <div 
                          key={p.id} 
                          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E4DAD2] hover:shadow-xl transition flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative h-48 overflow-hidden bg-black/5">
                              {p.image ? (
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#63383A]">
                                  <IconComp className="w-12 h-12" />
                                </div>
                              )}
                              <span className="absolute top-3 left-3 bg-[#63383A]/90 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                                <IconComp className="w-3 h-3" />
                                {p.category || 'Service'}
                              </span>
                            </div>

                            <div className="p-5">
                              <h3 className="font-serif text-lg font-bold text-[#292526] group-hover:text-[#63383A] transition line-clamp-1">{p.name}</h3>
                              {p.vendorName && (
                                <p className="text-[11px] text-[#B88A5A] font-semibold mt-0.5">By {p.vendorName}</p>
                              )}
                              {p.description && (
                                <p className="text-xs text-[#756C69] mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="p-5 pt-0 border-t border-[#FAF7F2] flex items-center justify-between mt-2">
                            <div>
                              <span className="text-[10px] text-[#756C69] uppercase block font-medium">Price</span>
                              <span className="text-base font-bold text-[#63383A]">{formatPrice(p.price)}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedProduct(p);
                                if (!currentUser) setShowAuthModal(true);
                                else setShowBookingModal(true);
                              }}
                              className="bg-[#63383A] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#9A6665] transition shadow"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* DEDICATED PRODUCTS & SERVICES VIEW (USER FACE) */}
          {currentView === 'products' && (() => {
            const filteredProducts = adminProducts.filter(p => {
              // Category filter
              if (productCategoryFilter !== 'All') {
                if ((p.category || '').toLowerCase() !== productCategoryFilter.toLowerCase()) return false;
              }
              // Search query
              if (productSearchQuery.trim()) {
                const q = productSearchQuery.toLowerCase();
                const matchName = (p.name || '').toLowerCase().includes(q);
                const matchCategory = (p.category || '').toLowerCase().includes(q);
                const matchVendor = (p.vendorName || '').toLowerCase().includes(q);
                const matchDesc = (p.description || '').toLowerCase().includes(q);
                if (!matchName && !matchCategory && !matchVendor && !matchDesc) return false;
              }
              return true;
            }).sort((a, b) => {
              if (productSortOrder === 'price-asc') return (a.price || 0) - (b.price || 0);
              if (productSortOrder === 'price-desc') return (b.price || 0) - (a.price || 0);
              return 0;
            });

            return (
              <div className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Catalog & Services</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Wedding Products & Services</h1>
                    <p className="text-xs text-[#756C69] mt-1">
                      Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                      {productCategoryFilter !== 'All' && <span> in <strong className="text-[#63383A]">{productCategoryFilter}</strong></span>}
                    </p>
                  </div>
                  
                  {/* Search & Sort Controls */}
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <input 
                      type="text" 
                      placeholder="Search service, venue, photographer..." 
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="px-4 py-2.5 rounded-full border border-[#E4DAD2] bg-white text-xs outline-none shadow-sm flex-1 sm:w-64"
                    />
                    <select
                      value={productSortOrder}
                      onChange={(e) => setProductSortOrder(e.target.value as any)}
                      className="px-4 py-2.5 rounded-full border border-[#E4DAD2] bg-white text-xs outline-none shadow-sm text-[#756C69]"
                    >
                      <option value="default">Sort: Default</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* CATEGORY FILTER CHIPS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                  <button
                    onClick={() => setProductCategoryFilter('All')}
                    className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      productCategoryFilter === 'All'
                        ? 'bg-[#63383A] text-white shadow-sm'
                        : 'bg-white text-[#756C69] border border-[#E4DAD2] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    All Services ({adminProducts.length})
                  </button>
                  {categoriesList.map((cat) => {
                    const count = adminProducts.filter(p => (p.category || '').toLowerCase() === (cat.name || '').toLowerCase()).length;
                    const isSelected = productCategoryFilter.toLowerCase() === (cat.name || '').toLowerCase();
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setProductCategoryFilter(cat.name)}
                        className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                          isSelected
                            ? 'bg-[#63383A] text-white shadow-sm'
                            : 'bg-white text-[#756C69] border border-[#E4DAD2] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E4DAD2] shadow-sm max-w-xl mx-auto">
                    <Package className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">
                      {productCategoryFilter !== 'All' ? `No Products in ${productCategoryFilter}` : 'No Products Matching Search'}
                    </h3>
                    <p className="text-xs text-[#756C69] mt-2 mb-6">
                      Try selecting another category or resetting the search filter.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => { setProductCategoryFilter('All'); setProductSearchQuery(''); }}
                        className="bg-[#63383A] text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((p) => {
                      const IconComp = getCategoryIcon(p.category || '');
                      return (
                        <div 
                          key={p.id} 
                          className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E4DAD2] hover:shadow-xl transition flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative h-60 overflow-hidden bg-black/5">
                              {p.image ? (
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#FAF7F2] text-[#63383A]">
                                  <IconComp className="w-16 h-16" />
                                </div>
                              )}
                              <span className="absolute top-4 left-4 bg-[#63383A]/90 backdrop-blur-sm text-white text-[11px] px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                <IconComp className="w-3.5 h-3.5" />
                                {p.category || 'Service'}
                              </span>
                              <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-green-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                                {p.status || 'Active'}
                              </span>
                            </div>

                            <div className="p-6">
                              <h3 className="font-serif text-2xl font-bold text-[#292526] group-hover:text-[#63383A] transition">{p.name}</h3>
                              {p.vendorName && (
                                <p className="text-xs text-[#B88A5A] font-semibold mt-1">Provided by {p.vendorName}</p>
                              )}
                              {p.description && (
                                <p className="text-xs text-[#756C69] mt-3 leading-relaxed">{p.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="p-6 pt-0 border-t border-[#FAF7F2] flex items-center justify-between mt-4">
                            <div>
                              <span className="text-[10px] text-[#756C69] uppercase block font-medium">Standard Rate</span>
                              <span className="text-xl font-bold text-[#63383A]">{formatPrice(p.price)}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setSelectedProduct(p);
                                if (!currentUser) setShowAuthModal(true);
                                else setShowBookingModal(true);
                              }}
                              className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                            >
                              Book Service
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* VENDORS MARKETPLACE VIEW */}
          {currentView === 'vendors' && (() => {
            const displayedVendors = vendors.filter(v => {
              if (categoriesList.length > 0) {
                const categoryExists = categoriesList.some(c => (c.name || '').toLowerCase() === (v.category || '').toLowerCase());
                if (!categoryExists) return false;
              }
              if (selectedCategoryFilter === 'All') return true;
              return (v.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase();
            });

            return (
              <div className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Live Directory</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Verified Wedding Services</h1>
                    <p className="text-xs text-[#756C69] mt-1">
                      Showing {displayedVendors.length} {displayedVendors.length === 1 ? 'service' : 'services'}
                      {selectedCategoryFilter !== 'All' && <span> in <strong className="text-[#63383A]">{selectedCategoryFilter}</strong></span>}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddVendorModal(true)}
                    className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Vendor Listing
                  </button>
                </div>

                {/* CATEGORY FILTER CHIPS (SYNCED WITH DATABASE) */}
                {categoriesList.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategoryFilter('All')}
                      className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        selectedCategoryFilter === 'All'
                          ? 'bg-[#63383A] text-white shadow-sm'
                          : 'bg-white text-[#756C69] border border-[#E4DAD2] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      All Categories ({vendors.filter(v => categoriesList.some(c => (c.name || '').toLowerCase() === (v.category || '').toLowerCase())).length})
                    </button>
                    {categoriesList.map((cat) => {
                      const count = vendors.filter(v => (v.category || '').toLowerCase() === (cat.name || '').toLowerCase()).length;
                      const isSelected = selectedCategoryFilter.toLowerCase() === (cat.name || '').toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryFilter(cat.name)}
                          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                            isSelected
                              ? 'bg-[#63383A] text-white shadow-sm'
                              : 'bg-white text-[#756C69] border border-[#E4DAD2] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          {cat.name} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {displayedVendors.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E4DAD2] shadow-sm max-w-xl mx-auto">
                    <Building className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">
                      {selectedCategoryFilter !== 'All' ? `No Listings in ${selectedCategoryFilter}` : 'No Vendors Listed Yet'}
                    </h3>
                    <p className="text-xs text-[#756C69] mt-2 mb-6 leading-relaxed">
                      {selectedCategoryFilter !== 'All'
                        ? 'There are no active vendor services under this category. Switch to all categories or add a listing.'
                        : 'The platform database is currently clean with no demo data. Click below to add your first real-time vendor listing.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {selectedCategoryFilter !== 'All' && (
                        <button 
                          onClick={() => setSelectedCategoryFilter('All')}
                          className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#292526] px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-white transition"
                        >
                          Show All Categories
                        </button>
                      )}
                      <button 
                        onClick={() => setShowAddVendorModal(true)}
                        className="bg-[#63383A] text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                      >
                        + Add First Vendor
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayedVendors.map((v) => (
                      <div 
                        key={v.id} 
                        onClick={() => { setSelectedVendor(v); setCurrentView('vendor-profile'); }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E4DAD2] hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-48 overflow-hidden">
                            <img src={v.coverImage} alt={v.businessName} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                            <span className="absolute top-3 left-3 bg-[#63383A] text-white text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                              {v.category}
                            </span>
                          </div>
                          <div className="p-5">
                            <h3 className="font-serif text-xl font-bold text-[#292526]">{v.businessName}</h3>
                            <p className="text-xs text-[#756C69] flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-[#9A6665]" /> {v.location}
                            </p>
                            <p className="text-xs text-[#756C69] mt-2 line-clamp-2">{v.description}</p>
                          </div>
                        </div>
                        <div className="p-5 pt-0 border-t border-[#FAF7F2] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#756C69] uppercase block">Starting Price</span>
                            <span className="text-sm font-bold text-[#63383A]">PKR {v.startingPrice ? Number(v.startingPrice).toLocaleString() : '150,000'}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E4DAD2]">
                            <Star className="w-3.5 h-3.5 fill-[#B88A5A] text-[#B88A5A]" />
                            <span className="text-xs font-bold text-[#292526]">{v.rating || 5.0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* LUXURY VENUES VIEW (DEMO IMAGES & REAL-TIME BOOKINGS) */}
          {currentView === 'venues' && (() => {
            const filteredVenues = DEMO_VENUES.filter(v => {
              if (venueCategoryFilter === 'All') return true;
              if (venueCategoryFilter === 'Palaces & Havelis') return v.type.includes('Heritage') || v.type.includes('Haveli');
              if (venueCategoryFilter === 'Ballrooms') return v.type.includes('Ballroom') || v.type.includes('Hotel');
              if (venueCategoryFilter === 'Lawns & Marquees') return v.type.includes('Lawns') || v.type.includes('Marquee');
              return true;
            });

            return (
              <div className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Exclusive Destinations</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Luxury Wedding Venues</h1>
                    <p className="text-xs text-[#756C69] mt-1">
                      Palaces, Grand Ballrooms, Royal Havelis & Scenic Marquees with live capacity and reservations.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddVendorModal(true)}
                    className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> List Your Venue
                  </button>
                </div>

                {/* VENUE FILTER CHIPS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                  {['All', 'Palaces & Havelis', 'Ballrooms', 'Lawns & Marquees'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setVenueCategoryFilter(tab)}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        venueCategoryFilter === tab
                          ? 'bg-[#63383A] text-white shadow-sm'
                          : 'bg-white text-[#756C69] border border-[#E4DAD2] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* VENUES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVenues.map((v) => (
                    <div 
                      key={v.id} 
                      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E4DAD2] hover:shadow-xl transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative h-60 overflow-hidden">
                          <img 
                            src={v.image} 
                            alt={v.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                            <span className="bg-[#63383A] text-white text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                              {v.type}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center justify-between text-xs text-[#756C69] mb-2">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#9A6665]" /> {v.city}</span>
                            <span className="flex items-center gap-1 font-semibold text-[#292526]"><Users className="w-3.5 h-3.5 text-[#B88A5A]" /> {v.capacity}</span>
                          </div>
                          <h3 className="font-serif text-2xl font-bold text-[#292526] group-hover:text-[#63383A] transition">{v.name}</h3>
                          <p className="text-xs text-[#756C69] mt-1 line-clamp-1">{v.location}</p>
                          <p className="text-xs text-[#756C69] mt-3 line-clamp-2 leading-relaxed">{v.description}</p>
                          
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {v.amenities.slice(0, 3).map((am, i) => (
                              <span key={i} className="text-[10px] bg-[#FAF7F2] border border-[#E4DAD2] text-[#756C69] px-2 py-0.5 rounded-full">
                                ✓ {am}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 pt-0 border-t border-[#FAF7F2] flex items-center justify-between mt-4">
                        <div>
                          <span className="text-[10px] text-[#756C69] uppercase block font-medium">Starting Reservation</span>
                          <span className="text-lg font-bold text-[#63383A]">{formatPrice(v.price)}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedVendor({
                              id: v.id,
                              businessName: v.name,
                              category: 'Venues',
                              location: v.location,
                              startingPrice: v.price,
                              coverImage: v.image,
                              description: v.description,
                              rating: v.rating
                            });
                            if (!currentUser) setShowAuthModal(true);
                            else setShowBookingModal(true);
                          }}
                          className="bg-[#63383A] text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#9A6665] transition shadow"
                        >
                          Book Venue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* WEDDING INSPIRATION & MOODBOARD VIEW (DEMO IMAGES & LIGHTBOX) */}
          {currentView === 'inspiration' && (() => {
            const categories = ['All', 'Bridal Couture', 'Stage & Mandap', 'Mehndi Themes', 'Cinematic Moments', 'Floral Magic', 'Dining & Catering'];
            const filteredInspirations = DEMO_INSPIRATIONS.filter(item => {
              if (inspirationCategoryFilter === 'All') return true;
              return item.category.toLowerCase() === inspirationCategoryFilter.toLowerCase();
            });

            return (
              <div className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Visual Moodboard</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Wedding Inspiration & Aesthetics</h1>
                    <p className="text-xs text-[#756C69] mt-1">
                      Curated photo collection of bridal couture, royal stages, mehndi aesthetics & fairytale florals.
                    </p>
                  </div>
                </div>

                {/* INSPIRATION FILTER PILLS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setInspirationCategoryFilter(cat)}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        inspirationCategoryFilter === cat
                          ? 'bg-[#63383A] text-white shadow-sm'
                          : 'bg-white text-[#756C69] border border-[#E4DAD2] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* INSPIRATION MASONRY GALLERY */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInspirations.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedInspirationImage(item)}
                      className="group relative rounded-3xl overflow-hidden shadow-sm border border-[#E4DAD2] bg-white cursor-pointer hover:shadow-xl transition flex flex-col justify-between"
                    >
                      <div className="relative h-72 overflow-hidden bg-black/5">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-95" 
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-[#63383A]/90 backdrop-blur-sm text-white text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                          <span className="text-xs text-[#E4DAD2] font-medium flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#B88A5A]" /> Click to view full image & details
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="font-serif text-xl font-bold text-[#292526] group-hover:text-[#63383A] transition">{item.title}</h3>
                        <p className="text-xs text-[#B88A5A] font-medium mt-1">Curated by {item.designer}</p>
                        <p className="text-xs text-[#756C69] mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] text-[#756C69] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E4DAD2]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* CURATED WEDDING PACKAGES VIEW */}
          {currentView === 'packages' && (
            <div className="px-6 lg:px-16 py-12 max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">All-Inclusive Luxury</span>
                <h1 className="font-serif text-4xl lg:text-5xl font-bold text-[#292526] mt-2">Curated Wedding Packages</h1>
                <p className="text-sm text-[#756C69] mt-3">
                  Hand-designed complete celebration packages including premier venues, floral stages, royal catering, and celebrity cinematography.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {DEMO_PACKAGES.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#E4DAD2] hover:shadow-xl transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-56 overflow-hidden">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
                        <span className="absolute top-4 left-4 bg-[#63383A] text-white text-[10px] px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                          {pkg.badge}
                        </span>
                      </div>

                      <div className="p-6">
                        <h3 className="font-serif text-2xl font-bold text-[#292526]">{pkg.name}</h3>
                        <p className="text-xs text-[#B88A5A] font-semibold mt-1">{pkg.guestCount}</p>
                        <p className="text-xs text-[#756C69] mt-3 leading-relaxed">{pkg.description}</p>

                        <div className="mt-6 pt-6 border-t border-[#E4DAD2] space-y-2.5">
                          <span className="text-xs font-bold text-[#292526] uppercase tracking-wider block">What's Included:</span>
                          {pkg.inclusions.map((inc, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[#756C69]">
                              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-[#FAF7F2] flex items-center justify-between mt-6">
                      <div>
                        <span className="text-[10px] text-[#756C69] uppercase block font-medium">All-Inclusive Price</span>
                        <span className="text-xl font-bold text-[#63383A]">{formatPrice(pkg.price)}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setBookingPackage(pkg);
                          if (!currentUser) setShowAuthModal(true);
                          else setShowBookingModal(true);
                        }}
                        className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                      >
                        Book Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* 2. CUSTOMER PORTAL (USER FACE) */}
      {activePortal === 'customer' && userRole !== 'admin' && (() => {
        const myOrders = currentUser?.email 
          ? orders.filter(o => !o.customerEmail || o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
          : orders;

        return (
          <main className="flex-1 px-6 lg:px-16 py-10 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Customer Portal (User Face)</span>
                <div className="flex items-center gap-3 mt-1">
                  {editingCoupleName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={coupleNameInput}
                        onChange={(e) => setCoupleNameInput(e.target.value)}
                        placeholder="Enter couple names (e.g. Fatima & Hamza)"
                        className="px-3 py-1.5 rounded-xl border border-[#E4DAD2] bg-white text-lg font-serif font-bold text-[#292526] outline-none shadow-sm"
                      />
                      <button 
                        onClick={() => handleSaveCoupleName(coupleNameInput)}
                        className="bg-[#63383A] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#9A6665]"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingCoupleName(false)}
                        className="px-2 py-1.5 text-xs text-[#756C69] hover:text-[#292526]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#292526]">
                        {currentUser?.displayName || 'Wedding Planning'}
                      </h1>
                      <button 
                        onClick={() => {
                          setCoupleNameInput(currentUser?.displayName || '');
                          setEditingCoupleName(true);
                        }}
                        title="Edit Couple Names"
                        className="p-1 text-[#756C69] hover:text-[#63383A] hover:bg-white rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#756C69] mt-1">
                  Real-time synchronized with your live account ({currentUser?.email || 'Logged in'}).
                </p>
              </div>
              
              <button 
                onClick={() => setCurrentView('vendors')}
                className="bg-[#63383A] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
              >
                + Book New Service
              </button>
            </div>

            {/* REAL-TIME DASHBOARD CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">Wedding Countdown</span>
                    <button 
                      onClick={() => setEditingWeddingDate(!editingWeddingDate)}
                      className="text-[10px] text-[#63383A] font-semibold hover:underline"
                    >
                      {weddingDate ? 'Change Date' : 'Set Date'}
                    </button>
                  </div>
                  {editingWeddingDate ? (
                    <div className="mt-3">
                      <input 
                        type="date"
                        value={weddingDate}
                        onChange={(e) => handleSaveWeddingDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E4DAD2] bg-[#FAF7F2] outline-none"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-serif text-3xl font-bold text-[#63383A] mt-2">
                        {weddingDate ? (
                          (() => {
                            const days = Math.ceil((new Date(weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            if (days > 0) return `${days} Days`;
                            if (days === 0) return 'Today! 💍';
                            return 'Celebrated! ✨';
                          })()
                        ) : (
                          <span className="text-base text-[#756C69] font-sans font-medium">Date Not Set</span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#9A6665] mt-1">
                        {weddingDate ? (
                          `Target: ${new Date(weddingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        ) : (
                          'Click Set Date above'
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                <span className="text-xs text-[#756C69] uppercase font-semibold">Total Budget</span>
                <p className="font-serif text-3xl font-bold text-[#292526] mt-2">
                  {formatPrice(totalBudgetPlanned)}
                </p>
                <p className="text-[11px] text-[#9A6665] mt-1">
                  Spent: {formatPrice(totalBudgetSpent)}
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                <span className="text-xs text-[#756C69] uppercase font-semibold">My Bookings</span>
                <p className="font-serif text-3xl font-bold text-[#63383A] mt-2">{myOrders.length}</p>
                <p className="text-[11px] text-[#9A6665] mt-1">Live from database</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                <span className="text-xs text-[#756C69] uppercase font-semibold">Tasks Checklist</span>
                <p className="font-serif text-3xl font-bold text-[#292526] mt-2">
                  {tasks.filter(t => t.status === 'Completed').length} / {tasks.length}
                </p>
                <p className="text-[11px] text-[#9A6665] mt-1">Milestones Completed</p>
              </div>
            </div>

            {/* MY BOOKINGS REAL-TIME */}
            <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#292526]">My Service Bookings ({myOrders.length})</h3>
                  <p className="text-xs text-[#756C69]">Live status of your reserved wedding venues & services.</p>
                </div>
                <button 
                  onClick={() => setCurrentView('vendors')}
                  className="text-xs text-[#63383A] font-semibold hover:underline"
                >
                  + Browse & Book Services →
                </button>
              </div>

              {myOrders.length === 0 ? (
                <div className="p-10 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E4DAD2]">
                  <ShoppingCart className="w-10 h-10 text-[#B88A5A] mx-auto mb-2" />
                  <h4 className="font-serif text-lg font-bold text-[#292526]">No Bookings Yet</h4>
                  <p className="text-xs text-[#756C69] mt-1 mb-4">Explore our luxury wedding products & services below to book your first reservation.</p>
                  <button 
                    onClick={() => { setActivePortal('public'); setCurrentView('products'); }}
                    className="bg-[#63383A] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                  >
                    Browse Products Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((o) => (
                    <div key={o.id} className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition">
                      <div>
                        <h4 className="text-sm font-bold text-[#292526]">{o.serviceName}</h4>
                        <p className="text-xs text-[#756C69] mt-0.5">
                          Partner: <strong className="text-[#63383A]">{o.vendorName || 'MILANÉ Partner'}</strong> • Date: {o.date || 'To be scheduled'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-sm font-bold text-[#63383A] block">{formatPrice(o.price)}</span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            o.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status || 'Confirmed'}
                          </span>
                        </div>
                        <button 
                          onClick={() => deleteOrder(o.id)}
                          title="Cancel Booking"
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE PRODUCTS & SERVICES FOR CUSTOMER PORTAL */}
            <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#292526]">Available Wedding Products & Services</h3>
                  <p className="text-xs text-[#756C69]">Reserve top-rated venues, cinematography, makeup and catering in 1-click.</p>
                </div>
                <button 
                  onClick={() => { setActivePortal('public'); setCurrentView('products'); }}
                  className="text-xs text-[#63383A] font-semibold hover:underline flex items-center gap-1"
                >
                  View All Products ({adminProducts.length}) →
                </button>
              </div>

              {adminProducts.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E4DAD2]">
                  <Package className="w-10 h-10 text-[#B88A5A] mx-auto mb-2" />
                  <p className="text-xs text-[#756C69]">No products in live catalog yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {adminProducts.slice(0, 4).map((p) => {
                    const IconComp = getCategoryIcon(p.category || '');
                    return (
                      <div key={p.id} className="bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                        <div>
                          <div className="relative h-32 overflow-hidden bg-black/5">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#63383A]">
                                <IconComp className="w-8 h-8" />
                              </div>
                            )}
                            <span className="absolute top-2 left-2 bg-[#63383A] text-white text-[9px] px-2 py-0.5 rounded-full font-semibold">
                              {p.category}
                            </span>
                          </div>
                          <div className="p-3">
                            <h4 className="font-bold text-xs text-[#292526] line-clamp-1">{p.name}</h4>
                            {p.vendorName && <p className="text-[10px] text-[#B88A5A] truncate">{p.vendorName}</p>}
                          </div>
                        </div>
                        <div className="p-3 pt-0 border-t border-[#E4DAD2]/60 flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-[#63383A]">{formatPrice(p.price)}</span>
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setShowBookingModal(true);
                            }}
                            className="bg-[#63383A] text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase hover:bg-[#9A6665]"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* BUDGET & CHECKLIST */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* BUDGET PLANNER */}
              <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">Budget & Expenses</h3>
                    <p className="text-xs text-[#756C69]">Live real-time budget tracking ({budgetItems.length} items).</p>
                  </div>
                  <button 
                    onClick={() => setShowNewExpenseModal(true)}
                    className="bg-[#63383A] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Expense
                  </button>
                </div>

                {budgetItems.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E4DAD2]">
                    <DollarSign className="w-10 h-10 text-[#B88A5A] mx-auto mb-2" />
                    <p className="text-xs text-[#756C69]">No expenses recorded yet. Click '+ Add Expense' to record real budget items.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {budgetItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] hover:bg-white transition">
                        <div>
                          <span className="text-xs font-bold text-[#63383A] uppercase tracking-wider">{item.category}</span>
                          <p className="text-xs text-[#756C69] mt-0.5">{item.notes}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="text-sm font-bold text-[#292526] block">{formatPrice(item.amount)}</span>
                            <button 
                              onClick={() => toggleExpensePaid(item.id, item.paid)}
                              className={`text-[10px] font-semibold ${item.paid ? 'text-green-600' : 'text-amber-600'} hover:underline`}
                            >
                              {item.paid ? '✓ Paid' : '○ Mark Paid'}
                            </button>
                          </div>
                          <button 
                            onClick={() => deleteExpense(item.id)}
                            title="Delete Expense"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WEDDING CHECKLIST */}
              <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">Wedding Checklist</h3>
                    <p className="text-xs text-[#756C69]">Live milestone tracker ({tasks.length} tasks).</p>
                  </div>
                  <button 
                    onClick={() => setShowNewTaskModal(true)}
                    className="bg-[#63383A] text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E4DAD2]">
                    <CheckCircle2 className="w-10 h-10 text-[#B88A5A] mx-auto mb-2" />
                    <p className="text-xs text-[#756C69]">No tasks in checklist yet. Click '+ Add Task' to record your wedding preparations.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] flex items-center justify-between hover:bg-white transition">
                        <div>
                          <h4 className={`text-xs font-bold ${task.status === 'Completed' ? 'line-through text-gray-400' : 'text-[#292526]'}`}>{task.title}</h4>
                          {task.dueDate && (
                            <p className="text-[11px] text-[#9A6665] mt-0.5">Due: {task.dueDate}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className={`text-[10px] px-3 py-1 rounded-full font-semibold border ${task.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-[#756C69] border-[#E4DAD2]'}`}
                          >
                            {task.status === 'Completed' ? 'Completed' : 'Mark Done'}
                          </button>
                          <button 
                            onClick={() => deleteTask(task.id)}
                            title="Delete Task"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        );
      })()}

      {/* 3. ENHANCED ADMIN PORTAL (REAL-TIME COMMAND CENTER) */}
      {(activePortal === 'admin' || userRole === 'admin') && (
        <main className="flex-1 flex flex-col md:flex-row w-full bg-[#FAF7F2]">
          {/* ADMIN SIDEBAR MATCHING REFERENCE LAYOUT */}
          <aside className="w-full md:w-64 bg-[#FAF7F2] text-[#292526] p-6 flex flex-col justify-between shrink-0 border-r border-[#E4DAD2]">
            <div>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#E4DAD2]">
                <div className="w-9 h-9 rounded-full bg-[#B88A5A] text-white flex items-center justify-center font-serif font-bold">
                  👑
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#292526]">Admin Controller</h3>
                  <p className="text-[10px] text-[#756C69]">MILANÉ Live Platform</p>
                </div>
              </div>

              {/* 8 EXACT NAV ITEMS FROM REFERENCE IMAGE */}
              <nav className="space-y-1">
                <button 
                  onClick={() => setAdminTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'dashboard' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <BarChart3 className="w-4 h-4" /> Dashboard & KPIs
                </button>
                <button 
                  onClick={() => setAdminTab('products')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'products' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <span className="flex items-center gap-3"><Package className="w-4 h-4" /> Products & Services</span>
                  <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">({adminProducts.length})</span>
                </button>
                <button 
                  onClick={() => setAdminTab('categories')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'categories' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <span className="flex items-center gap-3"><Layers className="w-4 h-4" /> Categories</span>
                  <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">({categoriesList.length})</span>
                </button>
                <button 
                  onClick={() => setAdminTab('vendors')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'vendors' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <span className="flex items-center gap-3"><Building className="w-4 h-4" /> Vendors & Partners</span>
                  <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">({vendors.length})</span>
                </button>
                <button 
                  onClick={() => setAdminTab('orders')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'orders' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <span className="flex items-center gap-3"><ShoppingCart className="w-4 h-4" /> Bookings & Orders</span>
                  <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">({orders.length})</span>
                </button>
                <button 
                  onClick={() => setAdminTab('users')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'users' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Persons / Users</span>
                  <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full">({usersList.length})</span>
                </button>
                <button 
                  onClick={() => setAdminTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${adminTab === 'settings' ? 'bg-[#63383A] text-white' : 'text-[#756C69] hover:bg-white hover:text-[#292526]'}`}
                >
                  <Settings className="w-4 h-4" /> Store Settings
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E4DAD2] mt-6">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 py-3 rounded-xl text-xs font-semibold transition"
              >
                <LogOut className="w-4 h-4" /> Admin Logout
              </button>
            </div>
          </aside>

          {/* ADMIN CONTENT AREA */}
          <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
            {/* 1. DASHBOARD & KPIS */}
            {adminTab === 'dashboard' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Executive Wedding Dashboard</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Real-time platform overview & live command center.</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-[#63383A] text-white px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow-sm flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Product
                    </button>
                    <button 
                      onClick={() => setShowAddCategoryModal(true)}
                      className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#292526] px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-white transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Category
                    </button>
                    <button 
                      onClick={() => setShowAddVendorModal(true)}
                      className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#292526] px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-white transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Vendor
                    </button>
                  </div>
                </div>

                {/* 6 REAL-TIME WEDDING PLATFORM METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">GROSS BOOKINGS VALUE</span>
                    <p className="font-serif text-3xl font-bold text-[#63383A] mt-2">{formatPrice(grossRevenue)}</p>
                    <p className="text-[11px] text-green-700 mt-1">From {totalOrders} active client bookings</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">TOTAL BOOKINGS</span>
                    <p className="font-serif text-3xl font-bold text-[#292526] mt-2">{totalOrders}</p>
                    <p className="text-[11px] text-[#756C69] mt-1">Live synchronized reservations</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">CATALOG SERVICES</span>
                    <p className="font-serif text-3xl font-bold text-[#292526] mt-2">{adminProducts.length}</p>
                    <p className="text-[11px] text-[#756C69] mt-1">Listed products & wedding packages</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">VERIFIED VENDORS</span>
                    <p className="font-serif text-3xl font-bold text-[#292526] mt-2">{vendors.length}</p>
                    <p className="text-[11px] text-[#756C69] mt-1">Directory partner listings</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">WEDDING CATEGORIES</span>
                    <p className="font-serif text-3xl font-bold text-[#292526] mt-2">{categoriesList.length}</p>
                    <p className="text-[11px] text-[#756C69] mt-1">Official service classifications</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <span className="text-xs text-[#756C69] uppercase font-semibold">REGISTERED USERS</span>
                    <p className="font-serif text-3xl font-bold text-[#292526] mt-2">{usersList.length}</p>
                    <p className="text-[11px] text-[#756C69] mt-1">Couples, vendors & administrators</p>
                  </div>
                </div>

                {/* RECENT RESERVATIONS & BOOKINGS (REAL-TIME) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif text-xl font-bold text-[#292526]">Recent Client Bookings</h3>
                      <button onClick={() => setAdminTab('orders')} className="text-xs text-[#63383A] font-semibold hover:underline">
                        View All ({orders.length}) →
                      </button>
                    </div>
                    {orders.length === 0 ? (
                      <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E4DAD2]">
                        <ShoppingCart className="w-10 h-10 text-[#B88A5A] mx-auto mb-2" />
                        <p className="text-xs text-[#756C69]">No bookings yet. Customer reservations will appear here in real-time.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 4).map((o) => (
                          <div key={o.id} className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] flex items-center justify-between text-xs">
                            <div>
                              <h4 className="font-bold text-[#292526]">{o.serviceName}</h4>
                              <p className="text-[11px] text-[#756C69]">By {o.customerName} • {o.date}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#63383A] block">{formatPrice(o.price)}</span>
                              <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">{o.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-serif text-xl font-bold text-[#292526]">Registered Users</h3>
                      <button onClick={() => setAdminTab('users')} className="text-xs text-[#63383A] font-semibold hover:underline">
                        View All ({usersList.length}) →
                      </button>
                    </div>
                    {usersList.length === 0 ? (
                      <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E4DAD2]">
                        <Users className="w-10 h-10 text-[#B88A5A] mx-auto mb-2" />
                        <p className="text-xs text-[#756C69]">No registered users yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {usersList.slice(0, 4).map((u) => (
                          <div key={u.id} className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#63383A] text-white flex items-center justify-center font-bold text-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#292526]">{u.name}</h4>
                                <p className="text-[11px] text-[#756C69]">{u.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-[#63383A] bg-[#63383A]/10 px-2 py-0.5 rounded-full">
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS & SERVICES (REAL-TIME & DEMO DATA CAPABLE) */}
            {adminTab === 'products' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Catalog Management</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Products & Services ({adminProducts.length})</h1>
                    <p className="text-xs text-[#756C69] mt-1">Manage wedding catalog packages, vendor products, and services in real-time.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={seedDemoProducts}
                      className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#63383A] hover:bg-[#63383A] hover:text-white px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition shadow-sm flex items-center gap-2"
                      title="Load curated luxury wedding demo products & packages into database"
                    >
                      <Sparkles className="w-4 h-4 text-[#B88A5A]" /> Add Demo Products
                    </button>
                    <button 
                      onClick={() => setShowAddProductModal(true)}
                      className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Product / Service
                    </button>
                  </div>
                </div>

                {adminProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E4DAD2] shadow-sm max-w-xl mx-auto">
                    <Package className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">No Products in Catalog</h3>
                    <p className="text-xs text-[#756C69] mt-2 mb-6">Click below to instantly populate rich luxury wedding demo products & services (Banquet halls, 4K cinematography, bridal makeup, floral stages, and catering feasts).</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button 
                        onClick={seedDemoProducts}
                        className="w-full sm:w-auto bg-[#63383A] text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-[#B88A5A]" /> Load Demo Products
                      </button>
                      <button 
                        onClick={() => setShowAddProductModal(true)}
                        className="w-full sm:w-auto border border-[#E4DAD2] text-[#292526] hover:bg-[#FAF7F2] px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition shadow"
                      >
                        + Add Custom Product
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-[#E4DAD2] shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#E4DAD2] text-xs font-bold text-[#756C69] uppercase">
                          <th className="p-4">Service / Product</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price ({storeSettings.currency || 'PKR'})</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4DAD2]">
                        {adminProducts.map((p) => {
                          const IconComp = getCategoryIcon(p.category || '');
                          return (
                            <tr key={p.id} className="text-xs hover:bg-[#FAF7F2]/50 transition">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  {p.image ? (
                                    <img 
                                      src={p.image} 
                                      alt={p.name} 
                                      className="w-12 h-12 rounded-xl object-cover border border-[#E4DAD2] shrink-0" 
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E4DAD2] flex items-center justify-center text-[#63383A] shrink-0">
                                      <IconComp className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-bold text-[#292526] text-sm">{p.name}</h4>
                                    {p.vendorName && (
                                      <p className="text-[11px] text-[#63383A] font-medium">By {p.vendorName}</p>
                                    )}
                                    {p.description && (
                                      <p className="text-[11px] text-[#756C69] line-clamp-1 max-w-md mt-0.5">{p.description}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="bg-[#FAF7F2] text-[#63383A] border border-[#E4DAD2] px-3 py-1 rounded-full font-semibold text-[11px] inline-flex items-center gap-1.5">
                                  <IconComp className="w-3 h-3" />
                                  {p.category || 'General'}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-sm text-[#292526]">
                                {storeSettings.currency || 'PKR'} {Number(p.price || 0).toLocaleString()}
                              </td>
                              <td className="p-4">
                                <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-bold text-[10px]">
                                  {p.status || 'Active'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  title="Delete Product"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-xl transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORIES MANAGEMENT (REAL-TIME) */}
            {adminTab === 'categories' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Classification System</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Categories ({categoriesList.length})</h1>
                    <p className="text-xs text-[#756C69] mt-1">Manage wedding service categories synced with the website catalogue.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={seedWebsiteCategories}
                      className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#63383A] hover:bg-[#63383A] hover:text-white px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition shadow-sm flex items-center gap-2"
                      title="Sync all 8 website categories into your database"
                    >
                      <Sparkles className="w-4 h-4 text-[#B88A5A]" /> Sync Website Categories
                    </button>
                    <button 
                      onClick={() => setShowAddCategoryModal(true)}
                      className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  </div>
                </div>

                {categoriesList.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E4DAD2] shadow-sm max-w-xl mx-auto">
                    <Layers className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">No Categories in Database</h3>
                    <p className="text-xs text-[#756C69] mt-2 mb-6">Click below to load all 8 official website categories (Venues, Photography, Bridal Makeup, Decor & Styling, Catering, Florists, Wedding Planners, Entertainment) into your live database.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button 
                        onClick={seedWebsiteCategories}
                        className="w-full sm:w-auto bg-[#63383A] text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-[#B88A5A]" /> Add Website Categories
                      </button>
                      <button 
                        onClick={() => setShowAddCategoryModal(true)}
                        className="w-full sm:w-auto bg-[#FAF7F2] border border-[#E4DAD2] text-[#292526] px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-white transition"
                      >
                        + Create Custom
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoriesList.map((cat) => {
                      const CatIcon = getCategoryIcon(cat.name || cat.icon || '');
                      const linkedProducts = adminProducts.filter(p => (p.category || '').toLowerCase() === (cat.name || '').toLowerCase()).length;
                      return (
                        <div key={cat.id} className="bg-white rounded-3xl border border-[#E4DAD2] shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition group">
                          {cat.image && (
                            <div className="h-28 w-full overflow-hidden relative">
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                                <span className="text-[10px] text-white/90 uppercase tracking-widest font-semibold">Website Category</span>
                              </div>
                            </div>
                          )}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#63383A]/10 text-[#63383A] flex items-center justify-center font-bold">
                                  <CatIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] bg-[#FAF7F2] border border-[#E4DAD2] text-[#756C69] px-2.5 py-1 rounded-full font-bold">
                                  {linkedProducts} {linkedProducts === 1 ? 'Product' : 'Products'}
                                </span>
                              </div>
                              <h3 className="font-serif text-xl font-bold text-[#292526]">{cat.name}</h3>
                              <p className="text-xs text-[#756C69] mt-2 line-clamp-2">{cat.description || 'Luxury wedding service classification'}</p>
                            </div>
                            <div className="pt-4 mt-4 border-t border-[#E4DAD2] flex items-center justify-between">
                              <span className="text-[10px] text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full font-semibold">Active Category</span>
                              <button 
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                title="Delete Category"
                                className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-xl transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. VENDORS & PARTNERS (REAL-TIME) */}
            {adminTab === 'vendors' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Partner Directory</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Vendors & Partners ({vendors.length})</h1>
                    <p className="text-xs text-[#756C69] mt-1">Manage verified wedding venues, photographers, stylists, and caterers.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddVendorModal(true)}
                    className="bg-[#63383A] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Vendor Listing
                  </button>
                </div>

                {vendors.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-[#E4DAD2] shadow-sm max-w-xl mx-auto">
                    <Building className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">No Vendors Listed</h3>
                    <p className="text-xs text-[#756C69] mt-2 mb-6">Click below to add a partner listing to the live wedding platform directory.</p>
                    <button 
                      onClick={() => setShowAddVendorModal(true)}
                      className="bg-[#63383A] text-white px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow"
                    >
                      + Add First Vendor
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((v) => (
                      <div key={v.id} className="bg-white rounded-3xl border border-[#E4DAD2] shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 overflow-hidden">
                            <img src={v.coverImage} alt={v.businessName} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 bg-[#63383A] text-white text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
                              {v.category}
                            </span>
                            <span className="absolute top-3 right-3 bg-white/95 text-[#292526] text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow">
                              <Star className="w-3 h-3 fill-[#B88A5A] text-[#B88A5A]" /> {v.rating || 5.0}
                            </span>
                          </div>
                          <div className="p-5">
                            <div className="flex items-center gap-1.5 text-xs text-[#B88A5A] font-semibold mb-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner
                            </div>
                            <h3 className="font-serif text-xl font-bold text-[#292526]">{v.businessName}</h3>
                            <p className="text-xs text-[#756C69] flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-[#9A6665]" /> {v.location}
                            </p>
                            <p className="text-xs text-[#756C69] mt-2 line-clamp-2">{v.description}</p>
                          </div>
                        </div>
                        <div className="p-5 pt-0 border-t border-[#FAF7F2] flex items-center justify-between mt-4">
                          <div>
                            <span className="text-[10px] text-[#756C69] uppercase block">Starting Price</span>
                            <span className="text-sm font-bold text-[#63383A]">{formatPrice(v.startingPrice)}</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteVendor(v.id)}
                            title="Delete Vendor"
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. BOOKINGS & ORDERS (REAL-TIME) */}
            {adminTab === 'orders' && (
              <div>
                <div className="mb-8">
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">Reservations</span>
                  <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Client Bookings & Orders ({orders.length})</h1>
                  <p className="text-xs text-[#756C69] mt-1">Real-time bookings placed across luxury venues and wedding services.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white p-16 rounded-3xl border border-[#E4DAD2] shadow-sm text-center max-w-xl mx-auto">
                    <ShoppingCart className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">No Active Bookings Yet</h3>
                    <p className="text-xs text-[#756C69] mt-2">New client bookings and orders placed across the platform will update here live in real-time.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-[#E4DAD2] shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#E4DAD2] text-xs font-bold text-[#756C69] uppercase">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Service / Package</th>
                          <th className="p-4">Partner</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4DAD2]">
                        {orders.map((o) => (
                          <tr key={o.id} className="text-xs hover:bg-[#FAF7F2]/50">
                            <td className="p-4">
                              <span className="font-bold text-[#292526] block">{o.customerName}</span>
                              <span className="text-[11px] text-[#756C69]">{o.customerEmail}</span>
                            </td>
                            <td className="p-4 font-medium text-[#292526]">{o.serviceName}</td>
                            <td className="p-4 text-[#B88A5A] font-medium">{o.vendorName || 'MILANÉ Partner'}</td>
                            <td className="p-4 font-bold text-[#63383A]">{formatPrice(o.price)}</td>
                            <td className="p-4 text-[#756C69]">{o.date}</td>
                            <td className="p-4">
                              <select 
                                value={o.status || 'Confirmed'}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                                  o.status === 'Confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                                  o.status === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  o.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleDeleteOrder(o.id)}
                                title="Delete Booking"
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 6. PERSONS / USERS (REAL-TIME) */}
            {adminTab === 'users' && (
              <div>
                <div className="mb-8">
                  <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">User Base</span>
                  <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Persons / Users ({usersList.length})</h1>
                  <p className="text-xs text-[#756C69] mt-1">Unique registered client profiles and platform administrators.</p>
                </div>

                {usersList.length === 0 ? (
                  <div className="bg-white p-16 rounded-3xl border border-[#E4DAD2] shadow-sm text-center max-w-xl mx-auto">
                    <Users className="w-16 h-16 text-[#B88A5A] mx-auto mb-4" />
                    <h3 className="font-serif text-2xl font-bold text-[#292526]">No Registered Users</h3>
                    <p className="text-xs text-[#756C69] mt-2">When users sign in or register on the site, their accounts will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-3xl border border-[#E4DAD2] shadow-sm space-y-4">
                    {usersList.map((u) => (
                      <div key={u.id} className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#63383A] text-white flex items-center justify-center font-bold text-sm">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#292526]">{u.name}</h4>
                            <p className="text-[11px] text-[#756C69]">Email: {u.email} • Role: <span className="font-semibold uppercase text-[#63383A]">{u.role}</span></p>
                            {u.lastLogin && (
                              <p className="text-[10px] text-[#9A6665] mt-0.5">Last Login: {new Date(u.lastLogin).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">Single Unique Profile</span>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            title="Remove User"
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 8. STORE SETTINGS (REAL-TIME CONFIGURED) */}
            {adminTab === 'settings' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] text-[#B88A5A] uppercase">System Configuration</span>
                    <h1 className="font-serif text-4xl font-bold text-[#292526] mt-1">Store Settings</h1>
                    <p className="text-xs text-[#756C69] mt-1">Manage global platform branding, contact details, policies, and currency.</p>
                  </div>
                  {settingsSavedSuccess && (
                    <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> Settings saved in real-time!
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveStoreSettings} className="space-y-8 max-w-4xl">
                  {/* CARD 1: PLATFORM IDENTITY & BRANDING */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-[#292526] mb-1 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-[#B88A5A]" /> Store Identity & Branding
                    </h3>
                    <p className="text-xs text-[#756C69] mb-6">Primary identity details displayed across customer and vendor interfaces.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Platform / Store Name</label>
                        <input 
                          type="text" 
                          required
                          value={storeSettings.platformName} 
                          onChange={(e) => setStoreSettings({...storeSettings, platformName: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm font-medium outline-none focus:border-[#63383A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Platform Tagline / Slogan</label>
                        <input 
                          type="text" 
                          value={storeSettings.tagline} 
                          onChange={(e) => setStoreSettings({...storeSettings, tagline: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Primary Admin / Contact Email</label>
                        <input 
                          type="email" 
                          required
                          value={storeSettings.adminEmail} 
                          onChange={(e) => setStoreSettings({...storeSettings, adminEmail: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Support Phone / WhatsApp</label>
                        <input 
                          type="text" 
                          value={storeSettings.supportPhone} 
                          onChange={(e) => setStoreSettings({...storeSettings, supportPhone: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: REGIONAL & FINANCIAL SETTINGS */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-[#292526] mb-1 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#B88A5A]" /> Regional & Commercial Policies
                    </h3>
                    <p className="text-xs text-[#756C69] mb-6">Financial parameters, transaction currencies, and location defaults.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Currency</label>
                        <select 
                          value={storeSettings.currency} 
                          onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        >
                          <option value="PKR">PKR (Pakistani Rupee)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="AED">AED (UAE Dirham)</option>
                          <option value="GBP">GBP (British Pound)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Commission Rate (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={storeSettings.commissionRate} 
                          onChange={(e) => setStoreSettings({...storeSettings, commissionRate: Number(e.target.value)})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Booking Advance Deposit (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={storeSettings.bookingDepositPercent} 
                          onChange={(e) => setStoreSettings({...storeSettings, bookingDepositPercent: Number(e.target.value)})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Headquarters City</label>
                        <input 
                          type="text" 
                          value={storeSettings.city} 
                          onChange={(e) => setStoreSettings({...storeSettings, city: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1.5">Official Platform Address</label>
                        <input 
                          type="text" 
                          value={storeSettings.address} 
                          onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                          className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none focus:border-[#63383A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: OPERATIONAL PREFERENCES */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E4DAD2] shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-[#292526] mb-1 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[#B88A5A]" /> Operational Preferences & Toggles
                    </h3>
                    <p className="text-xs text-[#756C69] mb-6">Automated notifications and operational controls.</p>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] cursor-pointer hover:bg-white transition">
                        <div>
                          <span className="text-sm font-bold text-[#292526] block">Real-time Order Alerts</span>
                          <span className="text-xs text-[#756C69]">Push live notifications whenever customers make a reservation or booking.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={storeSettings.orderNotifications}
                          onChange={(e) => setStoreSettings({...storeSettings, orderNotifications: e.target.checked})}
                          className="w-5 h-5 accent-[#63383A] rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] cursor-pointer hover:bg-white transition">
                        <div>
                          <span className="text-sm font-bold text-[#292526] block">Vendor Verification Requirement</span>
                          <span className="text-xs text-[#756C69]">Require manual admin review before newly registered vendors appear in the directory.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={storeSettings.vendorApprovalRequired}
                          onChange={(e) => setStoreSettings({...storeSettings, vendorApprovalRequired: e.target.checked})}
                          className="w-5 h-5 accent-[#63383A] rounded cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] cursor-pointer hover:bg-white transition">
                        <div>
                          <span className="text-sm font-bold text-[#292526] block">Maintenance Mode</span>
                          <span className="text-xs text-[#756C69]">Temporarily show a maintenance notice for scheduled platform updates.</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={storeSettings.maintenanceMode}
                          onChange={(e) => setStoreSettings({...storeSettings, maintenanceMode: e.target.checked})}
                          className="w-5 h-5 accent-[#63383A] rounded cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button 
                      type="submit" 
                      disabled={savingSettings}
                      className="bg-[#63383A] text-white px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingSettings ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Saving Settings...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" /> Save Store Settings
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={handleResetStoreSettings}
                      disabled={savingSettings}
                      className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#756C69] hover:text-[#292526] hover:bg-white px-6 py-4 rounded-full text-xs font-semibold uppercase tracking-wider transition disabled:opacity-50"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E4DAD2] shadow-2xl relative">
            <button onClick={() => setShowAddCategoryModal(false)} className="absolute top-6 right-6 text-[#756C69] hover:text-[#292526]">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#63383A] text-white flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#292526]">Add Category</h3>
                <p className="text-xs text-[#756C69]">Create a new service classification</p>
              </div>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Category Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Bridal Jewellery, Mehndi Artists, Invitations" 
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Category Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/... (or select preset below)" 
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({...newCategory, image: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                  />
                  {newCategory.image && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#E4DAD2] shrink-0 bg-black/5 shadow-sm">
                      <img src={newCategory.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#756C69] uppercase block mb-1.5">Quick Demo Images:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Venues', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Photography', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Makeup', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80' },
                    { label: 'Decor', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80' },
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setNewCategory(prev => ({ ...prev, image: p.img }))}
                      className={`group relative rounded-xl overflow-hidden border h-11 flex items-end p-1 text-[10px] font-semibold text-white transition ${newCategory.image === p.img ? 'ring-2 ring-[#63383A] border-transparent' : 'border-[#E4DAD2]'}`}
                    >
                      <img src={p.img} alt={p.label} className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition" />
                      <span className="relative z-10 truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Brief description of this service category..." 
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none resize-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#756C69] uppercase block mb-1.5">Official Categories (Click to auto-fill):</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Venues', 'Photography', 'Bridal Makeup', 'Decor & Styling', 'Catering', 'Florists', 'Wedding Planners', 'Entertainment'].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => {
                        const matched = WEBSITE_PAGE_CATEGORIES.find(c => c.name === preset);
                        setNewCategory({
                          name: preset,
                          description: matched?.description || 'Luxury wedding service classification',
                          icon: matched?.id || 'Layers',
                          image: matched?.image || ''
                        });
                      }}
                      className="text-[10px] bg-[#FAF7F2] border border-[#E4DAD2] hover:bg-[#63383A] hover:text-white px-2.5 py-1 rounded-full font-medium transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-3">
                <button type="submit" className="flex-1 bg-[#63383A] text-white py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow">
                  Save Category
                </button>
                <button type="button" onClick={() => setShowAddCategoryModal(false)} className="px-6 py-3 rounded-2xl border border-[#E4DAD2] text-xs font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-[#E4DAD2] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-2xl font-bold text-[#292526]">Add Product / Service</h3>
              <button 
                onClick={() => setShowAddProductModal(false)}
                className="text-[#756C69] hover:text-[#292526] p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Service / Product Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Royal Crystal Banquet Hall" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Category</label>
                  <select 
                    value={newProduct.category || (categoriesList[0]?.name || '')}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                  >
                    {categoriesList.length === 0 ? (
                      <option value="">No categories created yet</option>
                    ) : (
                      categoriesList.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Price ({storeSettings.currency || 'PKR'})</label>
                  <input 
                    type="number" 
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Vendor / Partner Provider (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Royal Palm Resort / Irfan Ahson Studio" 
                  value={newProduct.vendorName}
                  onChange={(e) => setNewProduct({...newProduct, vendorName: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Image URL</label>
                <div className="flex gap-2 mb-2">
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/... or pick a demo image below" 
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                  />
                  {newProduct.image && (
                    <div className="relative group shrink-0">
                      <img 
                        src={newProduct.image} 
                        alt="Preview" 
                        className="w-10 h-10 rounded-xl object-cover border border-[#E4DAD2]" 
                      />
                      <button
                        type="button"
                        onClick={() => setNewProduct({...newProduct, image: ''})}
                        title="Remove image"
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Demo Image Selection Grid */}
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E4DAD2] mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#63383A] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B88A5A]" /> Demo Images (Click to apply)
                    </span>
                    <span className="text-[10px] text-[#756C69]">
                      {newProduct.category ? `Filtered for ${newProduct.category}` : 'All images'}
                    </span>
                  </div>
                  
                  {/* Category-matched & popular demo images */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {(
                      newProduct.category 
                        ? [
                            ...PRODUCT_DEMO_IMAGES.filter(d => d.category.toLowerCase().includes(newProduct.category.toLowerCase()) || newProduct.category.toLowerCase().includes(d.category.toLowerCase())),
                            ...PRODUCT_DEMO_IMAGES.filter(d => !d.category.toLowerCase().includes(newProduct.category.toLowerCase()) && !newProduct.category.toLowerCase().includes(d.category.toLowerCase()))
                          ]
                        : PRODUCT_DEMO_IMAGES
                    ).slice(0, 8).map((demoImg, idx) => {
                      const isSelected = newProduct.image === demoImg.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, image: demoImg.url }))}
                          className={`group relative rounded-xl overflow-hidden border h-16 text-left transition ${
                            isSelected 
                              ? 'ring-2 ring-[#63383A] border-transparent shadow-md' 
                              : 'border-[#E4DAD2] hover:border-[#63383A]'
                          }`}
                        >
                          <img 
                            src={demoImg.url} 
                            alt={demoImg.title} 
                            className="absolute inset-0 w-full h-full object-cover brightness-[0.75] group-hover:scale-105 group-hover:brightness-90 transition duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                            <span className="text-[9px] font-bold text-white truncate leading-tight">{demoImg.title}</span>
                            <span className="text-[8px] text-[#E4DAD2] truncate">{demoImg.category}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-[#63383A] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Details of the package, inclusions, and execution standards..." 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none resize-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#756C69] uppercase block mb-1.5">Quick Demo Product Presets (With Demo Images):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {DEMO_PRODUCTS.slice(0, 6).map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => {
                        setNewProduct({
                          name: preset.name,
                          category: preset.category,
                          price: preset.price,
                          description: preset.description,
                          image: preset.image,
                          vendorName: preset.vendorName
                        });
                      }}
                      className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FAF7F2] border border-[#E4DAD2] hover:bg-[#63383A]/10 hover:border-[#63383A] text-left transition group"
                    >
                      <img 
                        src={preset.image} 
                        alt={preset.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-[#E4DAD2] shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold text-[#292526] truncate group-hover:text-[#63383A]">{preset.name}</div>
                        <div className="text-[9px] text-[#756C69] flex items-center gap-1.5">
                          <span className="text-[#B88A5A] font-semibold">{preset.category}</span>
                          <span>•</span>
                          <span className="font-bold text-[#292526]">PKR {preset.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-3">
                <button type="submit" className="flex-1 bg-[#63383A] text-white py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow">
                  Add to Live Catalog
                </button>
                <button type="button" onClick={() => setShowAddProductModal(false)} className="px-6 py-3 rounded-2xl border border-[#E4DAD2] text-xs font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E4DAD2] shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-[#292526] mb-4">Add Vendor Listing</h3>
            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Business Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Royal Palm Banquets" 
                  value={newVendor.businessName}
                  onChange={(e) => setNewVendor({...newVendor, businessName: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Category</label>
                <select 
                  value={newVendor.category || (categoriesList[0]?.name || '')}
                  onChange={(e) => setNewVendor({...newVendor, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                >
                  {categoriesList.length === 0 ? (
                    <option value="">No categories created yet</option>
                  ) : (
                    categoriesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Location / City</label>
                <input 
                  type="text" 
                  placeholder="Lahore, Pakistan" 
                  value={newVendor.location}
                  onChange={(e) => setNewVendor({...newVendor, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Starting Price ({storeSettings.currency || 'PKR'})</label>
                <input 
                  type="number" 
                  value={newVendor.startingPrice}
                  onChange={(e) => setNewVendor({...newVendor, startingPrice: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#63383A] text-white py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665]">
                  Publish Listing
                </button>
                <button type="button" onClick={() => setShowAddVendorModal(false)} className="px-6 py-3 rounded-2xl border border-[#E4DAD2] text-xs font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E4DAD2] shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-[#292526] mb-1">Confirm Service Booking</h3>
            <p className="text-xs text-[#756C69] mb-4">
              Booking: <strong className="text-[#63383A]">{bookingPackage ? bookingPackage.name : (selectedProduct ? selectedProduct.name : selectedVendor?.businessName)}</strong>
            </p>

            {(selectedProduct || bookingPackage) && (
              <div className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] mb-4">
                {(selectedProduct?.image || bookingPackage?.image) ? (
                  <img 
                    src={selectedProduct?.image || bookingPackage?.image} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-xl object-cover border border-[#E4DAD2] shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E4DAD2] flex items-center justify-center text-[#63383A] shrink-0 font-serif font-bold">
                    M
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#292526] truncate">{selectedProduct?.name || bookingPackage?.name}</h4>
                  <p className="text-[11px] text-[#756C69] truncate">
                    {selectedProduct?.vendorName ? `By ${selectedProduct.vendorName}` : (selectedProduct?.category || bookingPackage?.badge || 'Wedding Service')}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleBookService} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Wedding Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E4DAD2] flex justify-between items-center">
                <span className="text-xs text-[#756C69] font-medium">Estimated Amount</span>
                <span className="text-sm font-bold text-[#63383A]">
                  {formatPrice(bookingPackage ? bookingPackage.price : (selectedProduct ? selectedProduct.price : (selectedVendor?.startingPrice || 150000)))}
                </span>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#63383A] text-white py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665]">
                  Confirm & Book Now
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedProduct(null);
                    setBookingPackage(null);
                  }} 
                  className="px-6 py-3 rounded-2xl border border-[#E4DAD2] text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showNewExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E4DAD2] shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-[#292526] mb-4">Add Budget Expense</h3>
            <form onSubmit={addExpense} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Category</label>
                <select 
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                >
                  <option value="Venue">Venue</option>
                  <option value="Photography">Photography</option>
                  <option value="Bridal Wear">Bridal Wear</option>
                  <option value="Decor">Decor</option>
                  <option value="Catering">Catering</option>
                  <option value="Jewelry">Jewelry</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Amount (PKR)</label>
                <input 
                  type="number" 
                  required
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Notes</label>
                <input 
                  type="text" 
                  placeholder="Advance deposit or details"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#63383A] text-white py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665]">
                  Add Expense
                </button>
                <button type="button" onClick={() => setShowNewExpenseModal(false)} className="px-6 py-3 rounded-2xl border border-[#E4DAD2] text-xs font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-[#E4DAD2] shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-[#292526] mb-4">Add Checklist Milestone</h3>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Finalize bridal henna artist"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#756C69] uppercase block mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E4DAD2] bg-[#FAF7F2] text-sm outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-[#63383A] text-white py-3 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665]">
                  Add to Checklist
                </button>
                <button type="button" onClick={() => setShowNewTaskModal(false)} className="px-6 py-3 rounded-2xl border border-[#E4DAD2] text-xs font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPIRATION LIGHTBOX MODAL */}
      {selectedInspirationImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden border border-[#E4DAD2] shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedInspirationImage(null)} 
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-80 md:h-[480px] bg-black">
                <img 
                  src={selectedInspirationImage.image} 
                  alt={selectedInspirationImage.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="p-8 flex flex-col justify-between">
                <div>
                  <span className="bg-[#63383A] text-white text-[10px] px-3.5 py-1 rounded-full font-semibold uppercase tracking-wider inline-block mb-3">
                    {selectedInspirationImage.category}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#292526]">
                    {selectedInspirationImage.title}
                  </h3>
                  <p className="text-xs text-[#B88A5A] font-semibold mt-1">
                    Curated by {selectedInspirationImage.designer}
                  </p>
                  <p className="text-sm text-[#756C69] mt-4 leading-relaxed">
                    {selectedInspirationImage.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-[#E4DAD2]">
                    <span className="text-[11px] font-semibold text-[#756C69] uppercase block mb-2">Style Tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedInspirationImage.tags?.map((t: string, idx: number) => (
                        <span key={idx} className="text-xs bg-[#FAF7F2] border border-[#E4DAD2] text-[#292526] px-3 py-1 rounded-full">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#E4DAD2] flex gap-3">
                  <button 
                    onClick={() => {
                      setSelectedInspirationImage(null);
                      setCurrentView('vendors');
                    }}
                    className="flex-1 bg-[#63383A] text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-[#9A6665] transition shadow text-center"
                  >
                    Find Matching Vendors
                  </button>
                  <button 
                    onClick={() => {
                      alert('Saved to your wedding moodboard!');
                      setSelectedInspirationImage(null);
                    }}
                    className="bg-[#FAF7F2] border border-[#E4DAD2] text-[#292526] px-5 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-white transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#292526] text-[#FAF7F2] py-16 px-6 lg:px-16 mt-20 border-t border-[#E4DAD2]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#B88A5A] text-white flex items-center justify-center font-serif text-lg font-bold">
                {storeSettings.platformName ? storeSettings.platformName.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="font-serif text-2xl tracking-widest font-bold">
                {storeSettings.platformName ? storeSettings.platformName.split(' ')[0] : 'MILANÉ'}
              </span>
            </div>
            <p className="text-xs text-[#E4DAD2]/80 leading-relaxed">
              {storeSettings.tagline || "Your dream wedding, together. Pakistan's luxury wedding planning & vendor discovery platform."}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B88A5A] mb-4">Explore</h4>
            <ul className="space-y-2 text-xs text-[#E4DAD2]/80">
              <li><button onClick={() => setCurrentView('vendors')} className="hover:text-white">Find Vendors</button></li>
              <li><button onClick={() => setCurrentView('venues')} className="hover:text-white">Luxury Venues</button></li>
              <li><button onClick={() => setCurrentView('inspiration')} className="hover:text-white">Wedding Inspiration</button></li>
              <li><button onClick={() => setCurrentView('packages')} className="hover:text-white">Curated Packages</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B88A5A] mb-4">Portals</h4>
            <ul className="space-y-2 text-xs text-[#E4DAD2]/80">
              <li><button onClick={() => { if (!currentUser) setShowAuthModal(true); else setActivePortal('customer'); }} className="hover:text-white">Customer Portal</button></li>
              <li><button onClick={() => setShowAuthModal(true)} className="hover:text-white">Admin Controller</button></li>
              <li><button onClick={() => setShowAddVendorModal(true)} className="hover:text-white">List Your Business</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#B88A5A] mb-4">Contact & Headquarters</h4>
            <ul className="space-y-2 text-xs text-[#E4DAD2]/80">
              <li>{storeSettings.address || 'Gulberg III, Lahore, Pakistan'}</li>
              <li>Phone: {storeSettings.supportPhone || '+92 300 1234567'}</li>
              <li>Email: {storeSettings.adminEmail || 'bibij3370@gmail.com'}</li>
              <li>Headquarters: {storeSettings.city || 'Lahore, Pakistan'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-[#E4DAD2]/60">
          © {new Date().getFullYear()} {storeSettings.platformName || 'MILANÉ'}. All rights reserved. Crafted with elegance.
        </div>
      </footer>
    </div>
  );
}
