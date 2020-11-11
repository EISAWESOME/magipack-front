app.service('dofapiService', function ($rootScope, $http, $q) {
    const self = this;

    const baseUrl = "http://magipack.herokuapp.com/dofapi";

    this.getEquipAsync = (types) => {

        const getEquip = $q.defer();

        $http.post(baseUrl + "/equip", {
            Types : types
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