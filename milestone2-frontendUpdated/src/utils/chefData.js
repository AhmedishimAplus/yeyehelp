// src/utils/chefData.js
import FarmToTableRisottoImg from '../assets/images/Farm-to-Table Risotto.jpg';
import HeritageBeefWellingtonImg from '../assets/images/Heritage Beef Wellington.jpg';
import DeconstructedApplePieImg from '../assets/images/Deconstructed Apple Pie.jpg';

import VanillaCremeBruleeImg from '../assets/images/creme brule.jpg';
import ChocolateSouffleImg from '../assets/images/Chocolate Souffle.jpg';
import MacaronsImg from '../assets/images/Artisanal Macarons.jpg';

import TagenBamyaImg from '../assets/images/Tagen bamya bel lahma.jpg';
import KosharyImg from '../assets/images/Koshary.jpg';
import MacaronaBashamelImg from '../assets/images/Macarona Bashamel.jpg';

import HawashyImg from '../assets/images/Hawashy.jpg';
import MolokheyaImg from '../assets/images/Molokheya.jpg';

import TagenRozImg from '../assets/images/Tagen roz bel lahma.jpg';
import MahshyImg from '../assets/images/Mahshy.jpg';
import FataImg from '../assets/images/Fata.jpg';

import headChefImg from '../assets/images/chef.jpg';
import pastryChefImg from '../assets/images/cheff.jpg'; 
import sherbinyIMG from '../assets/images/sherbiny.jpg';
import hassanIMG from '../assets/images/hassan.jpg';
import ahmedIMG from '../assets/images/ahmed.jpg'; 

export const chefData = [
  {
    _id: 1,
    name: 'Head Chef',
    title: 'Executive Chef',
    specialty: 'Traditional dishes with a modern twist',
    bio: 'With over 15 years of culinary experience in top restaurants around the world, our Head Chef brings passion and innovation to every dish.',
    image: headChefImg,
    availableIn: ['all'], 
    recipes: [
      'Farm-to-Table Risotto',
      'Heritage Beef Wellington',
      'Deconstructed Apple Pie'
    ],
    menu: [
      {
        name: 'Farm-to-Table Risotto',
        image: FarmToTableRisottoImg,
        description: 'Creamy arborio rice cooked with seasonal vegetables & parmesan.',
        price: 85
      },
      {
        name: 'Heritage Beef Wellington',
        image: HeritageBeefWellingtonImg,
        description: 'Tender beef fillet wrapped in prosciutto and puff pastry.',
        price: 120
      },
      {
        name: 'Deconstructed Apple Pie',
        image: DeconstructedApplePieImg,
        description: 'Spiced apple compote, flaky pastry shards & vanilla gelato.',
        price: 45
      }
    ]
  },
  {
    _id: 2,
    name: 'Pastry Chef',
    title: 'Master Pastry Chef',
    specialty: 'Master of exquisite desserts',
    bio: 'Trained in Paris, our Pastry Chef combines classical techniques with contemporary aesthetics to create memorable dessert experiences.',
    image: pastryChefImg,
    availableIn: ['all'], 
    recipes: [
      'Vanilla Bean Crème Brûlée',
      'Chocolate Soufflé',
      'Artisanal Macarons'
    ],
    menu: [
      {
        name: 'Vanilla Bean Crème Brûlée',
        image: VanillaCremeBruleeImg,
        description: 'Rich custard infused with Tahitian vanilla, torched to order.',
        price: 50
      },
      {
        name: 'Chocolate Soufflé',
        image: ChocolateSouffleImg,
        description: 'Light, airy chocolate cake served warm with a molten center.',
        price: 55
      },
      {
        name: 'Artisanal Macarons',
        image: MacaronsImg,
        description: 'Assorted flavors: pistachio, raspberry, chocolate & more.',
        price: 35
      }
    ]
  },
  {
    _id: 3,  
    name: 'Chef Hassan',
    title: 'Specialty Chef',
    specialty: 'Authentic Egyptian Cuisine',
    bio: 'Chef Hassan is known for his mastery of traditional Egyptian dishes with rich flavors and authentic techniques.',
    image: hassanIMG, 
    availableIn: ['new cairo'],
    recipes: [
      'Tagen bamya bel lahma',
      'Koshary',
      'Macarona Bashamel'
    ],
    menu: [
      {
        name: 'Tagen bamya bel lahma',
        image: TagenBamyaImg,
        description: 'Okra & tender meat baked in tomato sauce, served with rice.',
        price: 65
      },
      {
        name: 'Koshary',
        image: KosharyImg,
        description: 'Layered rice, lentils, pasta, chickpeas & spiced tomato sauce.',
        price: 40
      },
      {
        name: 'Macarona Bashamel',
        image: MacaronaBashamelImg,
        description: 'Pasta with creamy béchamel, minced meat & melted cheese.',
        price: 60
      }
    ]
  },
  {
    _id: 4,
    name: 'Chef Sherbiny',
    title: 'Specialty Chef',
    specialty: 'Authentic Egyptian Cuisine',
    bio: 'Famous Chef Sherbiny is renowned for bringing the vibrant flavors and traditions of Egyptian food and home cooking to the table, exclusive only at Nafs.',
    image: sherbinyIMG, 
    availableIn: ['sheikh zayed'],
    recipes: [
      'Hawashy',
      'Koshary',
      'Molokheya'
    ],
    menu: [
      {
        name: 'Hawashy',
        image: HawashyImg,
        description: 'Spiced beef or chicken pocket grilled in traditional Egyptian bread.',
        price: 55
      },
      {
        name: 'Koshary',
        image: KosharyImg,
        description: "Egypt's national dish: rice, lentils, pasta & crispy onions.",
        price: 40
      },
      {
        name: 'Molokheya',
        image: MolokheyaImg,
        description: 'Jute leaf stew with garlic & coriander, served with rice.',
        price: 50
      }
    ]
  },
  { 
    _id: 5,  
    name: 'Alaa Sherbiny',
    title: 'Specialty Chef',
    specialty: 'Authentic Egyptian Cuisine',
    bio: 'Chef Alaa is known for his mastery of traditional Egyptian dishes with rich flavors and authentic techniques.',
    image: ahmedIMG, 
    availableIn: ['maadi'],
    recipes: [
      'Tagen roz bel lahma',
      'Mahshy',
      'Fata'
    ],
    menu: [
      {
        name: 'Tagen roz bel lahma',
        image: TagenRozImg,
        description: 'Rice & meat baked together in a clay pot, infused with spices.',
        price: 70
      },
      {
        name: 'Mahshy',
        image: MahshyImg,
        description: 'Stuffed vegetables with rice, herbs & ground meat.',
        price: 60
      },
      {
        name: 'Fata',
        image: FataImg,
        description: 'Layers of rice, bread & meat drizzled with garlic vinegar.',
        price: 65
      }
    ]
  }
];
