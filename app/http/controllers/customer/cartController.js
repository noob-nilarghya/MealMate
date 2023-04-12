
exports.viewCart= async (req, res) => {
    try{
        res.status(200).render('customers/cart'); // remmber we have set 'req.session' to res.locals.session in global middleware
        // so each and every ejs file will get the session info in 'session' variable
    } catch(err) {
        res.status(404).render('error', {
            message: "Can't view cart page :("
        }); 
    }
}

exports.addCart= async (req, res) => {
    // let cart = {
    //     items: {
    //         pizzaId1: {item: pizzaObject1, qty:0},
    //         pizzaId2: {item: pizzaObject2, qty:0},
    //         .....
    //     },
    //     totalQty: 0,
    //     totalPrice: 0
    // }
    try{

        // If half item was added reduce the price
        if(req.body.hfStatus === 'Half'){
            req.body.price= parseInt(req.body.price/2, 10) +5;
        }

        if (!req.session.cart) {
            req.session.cart = {
                items: {},
                totalQty: 0,
                totalPrice: 0
            };
        }

        const cart = req.session.cart;

        // Check if the item already exists in the cart. If it does, increment its quantity. If it doesn't, add it as a new item.
        if (cart.items[req.body._id] && cart.items[req.body._id][req.body.hfStatus]) {
            cart.items[req.body._id][req.body.hfStatus].qty++;
        } 
        else {
            if (!cart.items[req.body._id]) {
                cart.items[req.body._id] = {};
            }
            cart.items[req.body._id][req.body.hfStatus] = {
                item: req.body,
                qty: 1
            };
        }

        // Update the total quantity and price properties in the cart.
        cart.totalQty++;
        cart.totalPrice += req.body.price;

        //console.log(cart);

        //console.log(req.session.cart); // cart info has been stored in req.session.cart

        // Send a JSON response with the updated totalQty value in the user's session cart.
        res.status(200).json({
            status: "Success",
            totalQty: req.session.cart.totalQty // layout mein cart wala image ke side mein wo number wla quantity dikhana hai
        });

    } catch(err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}

exports.addItemFromCart= async (req, res) => {
    try{
        const cart = req.session.cart;
        //console.log(req.body);
        cart.items[req.body.item._id][req.body.item.hfStatus].qty++;
        cart.totalQty++;
        cart.totalPrice += req.body.item.price;

        res.status(200).json({
            status: "Success"
        });
    } catch( err ) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}

exports.removeCart= async (req, res) => {
    try{
        const cart = req.session.cart;
        //console.log(req.body);

        if (cart.items[req.body.item._id][req.body.item.hfStatus]) {
            cart.items[req.body.item._id][req.body.item.hfStatus].qty--;

            if(cart.items[req.body.item._id][req.body.item.hfStatus].qty==0) { // remove this item from cart
                delete cart.items[req.body.item._id][req.body.item.hfStatus]; // basically delete that key value pair
            }

            if(!cart.items[req.body.item._id].Half && !cart.items[req.body.item._id].Full){
                delete cart.items[req.body.item._id];
            }
        } 

        cart.totalQty--;
        cart.totalPrice -= req.body.item.price;

        if(cart.totalQty==0){
            delete req.session.cart;
        }


        res.status(200).json({
            status: "Success"
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message
        });
    }
}

