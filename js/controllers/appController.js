app.controller('AppController', function ($rootScope, $scope, dofapiService, ankamaService) {

    $scope.JobsToItemTypes = JobsToItemTypes;

    $scope.init = () => {


        // TODO : A integrer
        $scope.model = {

            chosenTypes: [],
            levelBetweenItems: 5, // Possible value 3, 5, 10  
            stats: {
                so: true,
                sa: true,
                prosp: true,
                do: true,

                vi: false,
                elem: false,

                pa: false,
                po: false,
                pm: false,
                invo: false,
            },
            result: [],
        }
    };

    $scope.findItems = () => {

        dofapiService.getEquipAsync($scope.model.chosenTypes).then((equip) => {

            // 1 - Donne un score a chaque item par rapport à ses stats interessante
            let weightedEquip = equip.map((e) => {

                // On prend en compte les soins, la sagesse, la prospection et les dommages
                e.score = 0;

                if (e.statistics) {
                    let stats = e.statistics;
                    let soinStat;
                    let sagesseStat;
                    let prospecStat;
                    let dommageStat;
                    let vitaStat;
                    let forceStat;
                    let agiStat;
                    let chanceStat;
                    let intelStat;
                    let paStat
                    let pmStat
                    let poStat
                    let invoStat

                    if ($scope.model.stats.so) {
                        soinStat = stats.find(s => s.hasOwnProperty("Soins"));
                    }

                    if ($scope.model.stats.sa) {
                        sagesseStat = stats.find(s => s.hasOwnProperty("Sagesse"));
                    }

                    if ($scope.model.stats.prosp) {
                        prospecStat = stats.find(s => s.hasOwnProperty("Prospection"));
                    }

                    if ($scope.model.stats.do) {
                        dommageStat = stats.find(s => s.hasOwnProperty("Dommages"));
                    }

                    if ($scope.model.stats.vi) {
                        vitaStat = stats.find(s => s.hasOwnProperty("Vitalité"));
                    }
                    if ($scope.model.stats.elem) {
                        forceStat = stats.find(s => s.hasOwnProperty("Force"));
                        agiStat = stats.find(s => s.hasOwnProperty("Agilité"));
                        chanceStat = stats.find(s => s.hasOwnProperty("Chance"));
                        intelStat = stats.find(s => s.hasOwnProperty("Intelligence"));
                    }


                    if ($scope.model.stats.pa) {
                        paStat = stats.find(s => s.hasOwnProperty("PA"));

                    }
                    if ($scope.model.stats.pm) {
                        pmStat = stats.find(s => s.hasOwnProperty("PM"));

                    }
                    if ($scope.model.stats.po) {
                        poStat = stats.find(s => s.hasOwnProperty("PO"));

                    }
                    if ($scope.model.stats.invo) {
                        invoStat = stats.find(s => s.hasOwnProperty("Invocation"));
                    }

                    if (soinStat || sagesseStat || prospecStat || dommageStat ||
                        forceStat || agiStat || chanceStat || intelStat ||
                        paStat || pmStat || poStat || invoStat) {

                        if (soinStat) {
                            e.score += Math.max(soinStat["Soins"].min, soinStat["Soins"].max) * 10;
                        }
                        if (sagesseStat) {
                            e.score += Math.max(sagesseStat["Sagesse"].min, sagesseStat["Sagesse"].max) * 3;
                        }
                        if (prospecStat) {
                            e.score += Math.max(prospecStat["Prospection"].min, prospecStat["Prospection"].max) * 3;
                        }
                        if (dommageStat) {
                            e.score += Math.max(dommageStat["Dommages"].min, dommageStat["Dommages"].max) * 10;
                        }


                        if (forceStat || agiStat || chanceStat || intelStat) {
                            if(forceStat) {
                                e.score += Math.max(forceStat["Force"].min, forceStat["Force"].max);
                            }

                            if(agiStat) {
                                e.score += Math.max(agiStat["Agilité"].min, agiStat["Agilité"].max);
                            }

                            if(chanceStat) {
                                e.score += Math.max(chanceStat["Chance"].min, chanceStat["Chance"].max);
                            }

                            if(intelStat) {
                                e.score += Math.max(intelStat["Intelligence"].min, intelStat["Intelligence"].max);
                            }
                        }

                        if(paStat) {
                            e.score += Math.max(paStat["PA"].min, paStat["PA"].max) * 100;
                        }
                        if(pmStat) {
                            e.score += Math.max(pmStat["PM"].min, pmStat["PM"].max) * 90;
                        }
                        if(poStat) {
                            e.score += Math.max(poStat["PO"].min, poStat["PO"].max) * 51;
                        }
                        if(invoStat) {
                            e.score += Math.max(paStat["Invocation"].min, paStat["Invocation"].max) * 30;
                        }
                    }
                }

                return e;
            });

            // 1.1 - Supprime les items sans score

            weightedEquip = weightedEquip.filter(we => we.score > 0);


            // 2 - Crée des sous listes par tranche de N level

            let itemsPerLevels = [];

            let cur = 0
            while (cur < 199) {

                let lower = cur + 1;
                let upper = cur + $scope.model.levelBetweenItems;
                let el = {
                    level: lower + "-" + upper,
                    items: weightedEquip.filter(we => we.level >= lower && we.level <= upper)
                }

                itemsPerLevels.push(el);

                cur = upper;
            }


            // 3 - Bind au model

            $scope.model.result = itemsPerLevels;

            console.log(itemsPerLevels);





        }, (err) => {
            console.error(err);
        })

    };

    $scope.makeId = () => {

        let id = makeid(32);
        return id;
    };

    $scope.getImgB64 = (imgUrl, id) => {
        ankamaService.getImgB64Async(imgUrl).then((res) => {
            //console.log(res.result)

            document.querySelector("#img" + id).src = res.result;
        })
    };

});