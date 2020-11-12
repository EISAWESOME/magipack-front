app.service('dofapiService', function ($rootScope, $http, $q) {
    const self = this;

    // PROD
    const baseUrl = "https://magipack.herokuapp.com/dofapi";

    // DEV 
    // const baseUrl = "http://localhost:3000/dofapi";


    this.getEquipAsync = (types, startingLevel) => {

        const getEquip = $q.defer();

        $http.post(baseUrl + "/equip", {
            Types : types,
            StartingLevel : startingLevel || 0,
        }).then((res) => {

            if(res && res.data) {
                // console.log(res.data);
                getEquip.resolve(res.data);
            }

        }, (err) => {
            getEquip.reject(err);
            // console.error(err);
        })

        return getEquip.promise;
    };
})