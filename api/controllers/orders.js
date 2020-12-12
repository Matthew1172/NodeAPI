const Order = require("../models/order");
exports.orders_get_all = (req, res, next) => {
    Order.find()
    .populate('product')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc =>{
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:6969/orders/' + doc._id
                    },
                    delete: {
                        type: 'DELETE',
                        url: 'http://localhost:6969/orders/' + doc._id    
                    }
                }
            }),
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
}

exports.order_delete = (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: "POST",
                url: "http://localhost:6969/orders",
                body: { productId: 'ID', quantity: 'Number'}
            }
        })
    })
    .catch(err => {
        res.status(500).json({
            error: err
        })
    });
}