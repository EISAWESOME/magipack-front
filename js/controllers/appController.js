app.controller('AppController', function ($rootScope, $scope, $mdDialog, dofapiService, ankamaService) {

    $scope.JobsToItemTypes = JobsToItemTypes;

    $scope.init = () => {

        $scope.loading = false;
        $scope.advancedOptions = false;
        $scope.isScrolledDown = false;


        $scope.model = {

            chosenTypes: [],
            levelBetweenItems: 5, // Possible value 3, 5, 10  
            startingLevel: 1,
            stats: {
                so: true,
                sa: true,
                prosp: true,
                do: true,

                doPou: true,

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

    $scope.openFaq = (ev) => {
        $mdDialog.show({
            templateUrl: 'views/faqDialog.html',
            // Appending dialog to document.body to cover sidenav in docs app
            // Modal dialogs should fully cover application to prevent interaction outside of dialog
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: false // Only for -xs, -sm breakpoints.
        }).then((answer) => {
            $scope.status = 'You said the information was "' + answer + '".';
        }, () => {
            $scope.status = 'You cancelled the dialog.';
        });
    };

    $scope.findItems = () => {

        $scope.loading = true;

        dofapiService.getEquipAsync($scope.model.chosenTypes, $scope.model.startingLevel).then((equip) => {

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
                    let dopouStat;
                    let vitaStat;
                    let forceStat;
                    let agiStat;
                    let chanceStat;
                    let intelStat;
                    let paStat;
                    let pmStat;
                    let poStat;
                    let invoStat;

                    let soinStatValue;
                    let sagesseStatValue;
                    let prospecStatValue;
                    let dommageStatValue;
                    let dopouStatValue;
                    let vitaStatValue;
                    let forceStatValue;
                    let agiStatValue;
                    let chanceStatValue;
                    let intelStatValue;
                    let paStatValue;
                    let pmStatValue;
                    let poStatValue;
                    let invoStatValue;

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

                    if ($scope.model.stats.dopou) {
                        dopouStat = stats.find(s => s.hasOwnProperty("Dommages Poussée"));
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

                    if (soinStat || sagesseStat || prospecStat || dommageStat || dopouStat ||
                        forceStat || agiStat || chanceStat || intelStat || vitaStat ||
                        paStat || pmStat || poStat || invoStat) {



                        e.scoreDetails = [];

                        let numOfStats = 0;

                        const addToScore = (statVar, statValueVar, statLabel, statWeight) => {
                            if (statVar) {
                                statValueVar = Math.max(statVar[statLabel].min, statVar[statLabel].max);
                                if (statValueVar > 0) {
                                    numOfStats++;

                                    e.score += statValueVar * statWeight;
                                    e.scoreDetails.push({
                                        amount: statValueVar,
                                        label: statLabel
                                    });
                                }
                            }
                        };

                        addToScore(soinStat, soinStatValue, "Soins", 10);

                        addToScore(sagesseStat, sagesseStatValue, "Sagesse", 3);

                        addToScore(prospecStat, prospecStatValue, "Prospection", 3);

                        addToScore(dommageStat, dommageStatValue, "Dommages", 10);

                        addToScore(vitaStat, vitaStatValue, "Vitalité", 0.2);

                        addToScore(dopouStat, dopouStatValue, "Dommages Poussée", 5);

                        addToScore(forceStat, forceStatValue, "Force", 1);

                        addToScore(agiStatValue, agiStatValue, "Agilité", 1);

                        addToScore(chanceStat, chanceStatValue, "Chance", 1);

                        addToScore(intelStat, intelStatValue, "Intelligence", 1);

                        addToScore(paStat, paStatValue, "PA", 100);

                        addToScore(pmStat, pmStatValue, "PM", 90);

                        addToScore(poStat, poStatValue, "PO", 51);

                        addToScore(invoStat, invoStatValue, "Invocation", 30);



                        e.coef = 1 + ((numOfStats - 1) * 0.5)

                        if (e.coef) {

                            e.score *= e.coef;
                        }
                    }
                }

                return e;
            });

            // 1.1 - Supprime les items sans score

            weightedEquip = weightedEquip.filter(we => we.score > 0);


            // 2 - Crée des sous listes par tranche de N level

            let itemsPerLevels = [];

            let cur = $scope.model.startingLevel - 1 || 0;
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

            //console.log(itemsPerLevels);
            $scope.advancedOptions = false;
            $scope.loading = false;



            // 4 - Scroll jusqu'aux resultats

            let resultContainer = document.querySelector(".result-container");
            if (resultContainer) {
                let offset = resultContainer.offsetTop;
                setTimeout(() => {
                    window.scrollTo({
                        top: offset,
                        behavior: 'smooth'
                    });

                }, 100);
            }




        }, (err) => {
            $scope.loading = false;
            console.error(err);
        })

    };

    $scope.displayScoreDetails = (details, coef) => {

        let ret = "";

        if (details) {
            details.forEach((d) => {

                ret += d.amount + " " + d.label + "\n"

            });
        }

        ret += "Coef : " + coef;

        return ret;
    };

    $scope.makeId = () => {

        let id = makeid(32);
        return id;
    };

    $scope.getImgB64 = (imgUrl, id) => {

        $scope.$evalAsync(() => {
            let img = document.querySelector("#img" + id);

            if (img) {
                ankamaService.getImgB64Async(imgUrl).then((res) => {
                    //console.log(res.result)

                    img.src = res.result;
                });
            }
        });
    };


    window.onscroll = (ev) => {
        let ret = window.scrollY > 200;
        if ($scope.isScrolledDown != ret) {
            $scope.$evalAsync(() => {
                $scope.isScrolledDown = ret;

            });
        }

    };

    $scope.backToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };



});