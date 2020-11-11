app.service('ankamaService', function ($rootScope, $http, $q) {
    const self = this;

    const baseUrl = "http://magipack.herokuapp.com/ankama";

    this.getImgB64Async = (imgUrl) => {

        const getImgB64 = $q.defer();

        $http.post(baseUrl + "/imgB64", {
            imgUrl : imgUrl
        }).then((res) => {

            if(res && res.data) {
                // console.log(res.data);
                getImgB64.resolve(res.data);
            }

        }, (err) => {
            getImgB64.reject(err);
            // console.error(err);
        })

        return getImgB64.promise;

    };
})