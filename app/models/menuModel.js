const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'A menu must have a name']
    },
    foodType: {
        type: String,
        enum: ['Pizza', 'Main Course', 'Chinese', 'Thali', 'Biryani', 'Rice/Roti'],
        required: [true, 'Menu must have a type']
    },
    image: { 
        type: String, 
        default: 'default.jpg'
    },
    price: { 
        type: Number, 
        required: [true, 'A menu must have a price']
    },
    halfFull: { 
        type: Boolean, 
        default: false
    },
    isVeg: {
        type: Boolean, 
        required: [true, 'Veg/Non-veg field should not be empty']
    },
    description: {
        type: String,
        required: [true, 'Food Item must have description']
    }
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports= Menu;