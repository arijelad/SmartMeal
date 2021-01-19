module.exports = {
    administrator: (req, res, next)=>{
        if(req.isAuthenticated() && req.user.id_type === 2){
            return next();
        }
        req.flash('error', "Nije moguce pristupiti ukoliko niste administrator");
        res.redirect('/users/login');
    },
    administratorRestaurant: (req, res, next)=>{
        if(req.isAuthenticated() && req.user.id_type === 1){
            return next();
        }
        req.flash('error', "Nije moguce pristupiti ukoliko niste administrator restorana");
        res.redirect('/users/login/adminrestaurant');
    },
    deliverer: (req, res, next)=>{
        if(req.isAuthenticated() && req.user.id_type === 3){
            return next();
        }
        req.flash('error', "Nije moguce pristupiti ukoliko niste dostavljac");
        res.redirect('/');
    },
    customer: (req, res, next)=>{
        if(req.isAuthenticated() && req.user.id_type === 6) {
            return next();
        }
        req.flash('error', "Nije moguce pristupiti ukoliko niste kupac");
        res.redirect('/users/login/customer')
    }
}