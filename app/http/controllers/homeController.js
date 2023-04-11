
const Menu= require('../../models/menuModel');
const User= require('../../models/userModel');

exports.viewHome= async (req, res) => {
    const number = await User.countDocuments();
    res.status(200).render('home', {
        cnt: number
    });
}

exports.viewMenu= async (req, res) => {
    try{

        const menusArray= await Menu.find();
        if(!menusArray){ throw new Error("Can't find menus from database!"); }

        res.status(200).render('menu', {
            pizzas: menusArray
        });
    } catch(err) {
        res.status(404).render('error');
    }
}

exports.viewMe= async (req, res) => {
    try{
        res.status(200).render('customers/userAccount');
    } catch (err) {
        res.status(404).render('error');
    }
}

exports.viewUpdateInfo= async (req, res) => {
    try{
        res.status(200).render('updateInfo');
    } catch(err) {
        res.status(404).render('error');
    }
}

exports.viewUpdatePassword= async (req, res) => {
    try{
        res.status(200).render('updatePassword');
    } catch (err) {
        res.status(404).render('error');
    }
}

exports.viewError= async (req, res) => {
    res.status(404).render('error');
}
