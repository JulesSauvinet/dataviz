//---------------------------------------------------------- IDEES ----------------------------------------------------------

// ----------- SUPER UTILE -----------
//TODO plus de données et exploiter plus les données
//TODO trouver les bonnes suggestions
//TODO optimiser et nettoyer le code


// ----------- AMELIORATION -----------
//TODO améliorer la légende
//TODO faire du design, sur le panneau de droite notamment


// ----------- OPTIMISATION -----------
//TODO faire des graphiques quand on selectionne une region?
//TODO zoom sur les cartes?

//---------------------------------------------------------------------------------------------------------------------------


//---------------------------------------------------------- CODE -----------------------------------------------------------
// valeurs par défaut pour le polluant, la mesure et la normalisation courant(e) sélectionné(e)
var curPol = "NH3";
var curMes = "c";
var normalisation = "pop";

// map pour stocker les unités des différent(e)s polluants + mesures
var unitPolMap = {};
var unitMesMap = {};

// construction d'une smallMap : dimensions d'1 smallMap
var mapWidth = 230;
var mapHeight = 180;

// conteneurs des smallMaps de pollution
var dateJoin,divs,SVGs;

// conteneurs des smallMaps de mesure
var dateJoin2,divs2,SVGs2;

// projection + path de l'europe d'une small map
var projection = d3.geo.stereographic().center([3.9,43.0]).scale(375).translate([mapWidth / 2-20, mapHeight / 2+43]);
var path = d3.geo.path().projection(projection);

// tableau des années parmi lesquelles on va choisir les années pour lesquelles on va afficher les smallMaps
var dateFormat = d3.time.format("%Y");
var years = ["1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014"];

// tableau contenant toutes les mesures
var mesures = ['Morts de cancers', 'Pesticides', 'Production d\'énergie', 'Chauffage Nucleaire',
               'Taxes environnementales', 'Taxe transport', 'Morts de maladies cardiaques',
               'Moteurs de voitures diesel', 'Production d\'énergie renouvelable',
               'Moteurs de voitures pétrole', 'Fertilisants au Nitrogene',
               'Fertilisants au Phosphore','Fertilisants au Potassium'];


// map qui associe une abbréviation a chaque polluant
var polNameMap = {'NH3' : 'Ammoniac', 'NMVOC' : 'Composés volatiles organiques', 'NOX' : 'Oxyde d\'azote',
                  'PM10' : 'Particules 10μm', 'PM2_5': 'Particules 2.5μm', 'SOX' : 'Oxyde de soufre'};
                  
// map qui associe une abbréviation a chaque mesure
var mesNameMap = {'Pesticides' : 'pe', 'Production d\'énergie':'en', 'Chauffage Nucleaire' :'cn', 'Taxes environnementales' : 'te',
                    'Taxe transport' : 'tr', 'Morts de maladies cardiaques':'hd', 'Morts de cancers' : 'c',
                    'Moteurs de voitures diesel' : 'mvd', 'Moteurs de voitures pétrole' : 'mvp', 'Production d\'énergie renouvelable' : 'enr',
                    'Fertilisants au Nitrogene' : 'fN','Fertilisants au Phosphore' : 'fPh','Fertilisants au Potassium' : 'fPo'};

//fonction de récupération du nom long d'une mesure a partir d'un code
function getNameFromMesCode(mesCode){
    for (var mesure in mesNameMap){
        if (mesNameMap[mesure] === mesCode)
            return mesure;
    }
}

// Map qui permet d'associer a chaque polluant, la liste des mesures pour lesquelles
// il y a une possible correspondance polluant/mesure, on utilise cette map pour afficher
// dynamiquement les mesures à afficher une fois le choix du polluant fait
var correspondanceMap = {'NH3'   : ['Pesticides','Fertilisants au Nitrogene','Fertilisants au Phosphore',
                                    'Fertilisants au Potassium', 'Taxes environnementales'],
                         'NMVOC' : ['Moteurs de voitures pétrole','Production d\'énergie',
                                    'Production d\'énergie renouvelable'],
                         'NOX'   : ['Production d\'énergie','Production d\'énergie renouvelable',
                                    'Chauffage Nucleaire'],
                         'PM10'  : ['Moteurs de voitures diesel','Taxes environnementales','Taxe transport','Morts de cancers',
                                    'Morts de maladies cardiaques'],
                         'PM2_5' : ['Moteurs de voitures diesel','Taxes environnementales','Taxe transport','Morts de cancers',
                                    'Morts de maladies cardiaques'],
                         'SOX'   : ['Chauffage Nucleaire','Production d\'énergie',
                                    'Production d\'énergie renouvelable']
                        };


// map qui traduit le nom des pays de l'Europe du nom international utilisé par NUTS1 en français
// pour rendre la vizu plus claire, on utilise cette map de correspondance
var regionNameMap = {'España' : 'Espagne', 'France' : 'France', 'Portugal' : 'Portugal',
                    'Suomi / finland' : 'Finlande', 'Sverige' : 'Suède', 'Polska' : 'Pologne',
                    'Italia' : 'Italia', 'Latvija' : 'Lettonie', 'Ireland' : 'Irlande',
                    'United kingdom' : 'Grande-Bretagne', 'Deutschland' : 'Allemagne',
                    'Nederland' : 'Pays-Bas', 'Belgique-belgië' : 'Belgique', 'Danmark' : 'Danemark',
                    'România': 'Roumanie', 'Luxembourg' : 'Luxembourg', '???????? (bulgaria)' : 'Bulgarie',
                    '?????? (ellada)' : 'Grèce', 'Magyarorszàg' : 'Hongrie', 'Österreich' : 'Autriche',
                    'Lietuva' : 'Lituanie', 'Hrvatska' : 'Croatie', 'Slovensko' :'Slovaquie',
                    'Slovenija' : 'Slovénie', '?eská republika' : 'République tchèque', 'Eesti' : 'Estonie',
                    '?????? (kýpros)' : 'Chypre' , 'Malta' : 'Malte'};

/* ----------- création du tooltip qui sera utilisé pour afficher des infos sur les smallMaps ----------- */
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d,date, isPol) {
        var name = d.properties["NAME"];
        var name = regionNameMap[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()];
        var toDisplay = name +'</br>';
        return toDisplay;
    });


/* ----------       fonction pour créer le div du choix de la normalisation des données       ----------- */
function createNormaDiv() {
    var fieldset = d3.select("#normalisationdiv").append("form").attr('class',"normalegend");
    fieldset.append("legend").html(
        '<h5>Choix de la normalisation :</h5>'+
        '<span class="radio">' +
        '<input type="radio" name = "choice" class ="choice" id="radPop" value="pop" checked>' +
        '<label class ="radiolabel">/Population</label>' +
        '</span>'+ //'</br>'+
        '<span class="radio">' +
        '<input type="radio" name = "choice" class ="choice" id="radDens" value="dens">' +
        '<label class ="radiolabel">*Densité/Population</label>' +
        '</span>');

    var buttonsRad = d3.selectAll("input[type=radio][name=choice]");

    for (var i =0; i<2; i++){
        buttonsRad[0][i].addEventListener("click", function() {
            normalisation=this.value;
            updateScalesColor();
            updateMes();
            updatePol();
        }, false);
    }
}


/* ----------           fonction pour créer le div des polluants de manière dynamique          ----------- */
var pollutants = [];
/* ----------------------------- fonction pour créer le div des polluants de manière dynamique ----------------------------- */
var pollutants = [];
function createPolDiv(pollutions){
    pollutions.forEach(function(p){
        if (!pollutants.includes(p.airpol)) {
            pollutants.push(p.airpol);
        }
    });

    var fieldset = d3.select("#pollutiondiv").append("form");
    fieldset.html('<h5> Choix du polluant : </h5>');
    var radioSpan = fieldset.selectAll(".radio").data(pollutants);

    radioSpan.enter().append("span")
        .attr("class", "radio");

    radioSpan.append("input")
        .attr({
            type: "radio",
            name: "pol",
            class : "radiopol",
            id : function(d,i) { return 'polradio' + i;}
        })
        .property({
            checked: function(d,i) { return (i ===0); },
            value: function(d) { return d }
        });

    radioSpan.append("label")
        .attr('class', 'radiolabel')
        .html(function(d, i) {  return d.last == true ? polNameMap[d] :  polNameMap[d] + '<br>'});
    radioSpan.exit().remove();

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=pol]")
        .on("change", function() {
            updatePol();
        });
}

/* ----------------------------- fonction pour créer le div des mesures de manière dynamique ----------------------------- */
var fieldset,radioSpan;
function createMesureDiv() {
    fieldset = d3.select("#mesurediv").append("form");
    fieldset.html('<h5>Choix de la mesure : </h5>');

    radioSpan = fieldset.selectAll(".radio").data(mesures);

    radioSpan.enter().append("span")
        .attr("class", "radio");

    radioSpan.append("input")
        .attr({
            type: "radio",
            name: "mesure",
            class : "radiomesure",
            id : function(d,i) { return 'mesureradio' + i;},
            value : function(d,i) { return mesNameMap[d];}
        })
        .property({
            checked: function(d,i) { return (i ===0); },
            value: function(d) { return d; }
        });

    radioSpan.append("label")
        .attr('class', 'radiolabel')
        .html(function(d, i) {  return d.last == true ? d :  d + '<br>'});
    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=mesure]")
        .on("change", function() {
            updateMes();
            updatePol();
        });
}


/* -----------------      fonction qui met a jour le div des mesures en fcn du polluant     ------------------ */
/* ----------------------------- fonction qui met a jour le div des mesures en fcn du polluant ----------------------------- */
function updateMesureDiv(mesures) {
    radioSpan.exit().remove();
    radioSpan.selectAll(".radio").remove();
    radioSpan.selectAll(".radiomesure").remove();
    radioSpan.selectAll(".radiolabel").remove();

    radioSpan = fieldset.selectAll(".radio").data(mesures);

    radioSpan.enter().append("span")
        .attr("class", "radio");

    radioSpan.append("input")
        .attr({
            type: "radio",
            name: "mesure",
            class : "radiomesure",
            id : function(d,i) { return 'mesureradio' + i;},
            value : function(d,i) { return mesNameMap[d];}
        })
        .property({
            checked: function(d,i) {return (mesNameMap[d] === curMes); },
            value: function(d) { return d }
        });

    radioSpan.append("label")
        .attr('class', 'radiolabel')
        .html(function(d, i) {  return d.last == true ? d :  d + '<br>'});

    var checked = false;
    d3.selectAll(".radiomesure").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            checked = true;
        }
    });

    if (!checked){
        d3.selectAll(".radiomesure")[0][0].checked = true;
        curMes = mesNameMap[d3.selectAll(".radiomesure")[0][0].value];
        updateMes();
    }

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=mesure]")
        .on("change", function() {
            updateMes();
            updatePol();
        });
}


/* ----------------------------- fonction qui créé les datasets des polluants pour chaque polluant ----------------------------- */
/* ------------------------------ on récupère ici les années disponibles dans le fichier polluant ------------------------------ */
var polMap = {};
var yearPol = [];
function createPolDatas(pollutions){
    pollutants.forEach(function(pollutant){
        var geoNot = ["EU28"/*, "CH"*/];
        var pollution = pollutions.filter(function(d,i){
            if (!unitPolMap[pollutant])
                unitPolMap[pollutant] = d.unit;
            return (!geoNot.includes(d.geo) && d.airpol === pollutant && d.airsect === "TOT_NAT")
        });
        polMap[pollutant] = pollution;
    });
    yearsTmp = Object.keys(pollutions[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {yearPol.push(d);}});
}


/* -------------------- fonction qui réalise le mapping entre les données NUTS et nos donnéees de polluants ---------------------- */
var dataMap = {};
var geoPol = {};
function createMergedPolAndMapData(europe){
    pollutants.forEach(function(pollutant){
        var pollution = polMap[pollutant];
        var dataRaw = topojson.feature(europe, europe.objects.regions).features;

        var data = JSON.parse(JSON.stringify(dataRaw));

        //création d'un tableau des codes nuts 1
        var geos = [];
        pollution.forEach(function(p){if (!geos.includes(p["geo"]))geos.push(p["geo"]);});

        data = data.filter(function(d,i){return geos.includes(d.properties["NUTS_ID"])});

        data.forEach(function(d) {
            pollution.forEach(function (p) {
                if (d.properties["NUTS_ID"] === p["geo"]) {
                    years.forEach(function (year) {
                        d.properties[year] = parseFloat(p[year]);
                    });
                    if (!d.properties.dens)
                        d.properties.dens = p["dens"];
                    if (!d.properties.pop)
                        d.properties.pop = p["pop"];
                }

            });
        });

        dataMap[pollutant] = data;
    });
    for (var pollutant in dataMap){
        geoPol[pollutant]=[];
        dataMap[pollutant].forEach(function(d){
            geoPol[pollutant].push(d.properties["NUTS_ID"]);
        });
    }
}


/* ------------- fonction pour unifier les données des polluants et d'une   ---------------------- */
/* ------------- mesure au sein d'un meme et unique dataset                ---------------------- */
function mergeData(data1,data2,mes){
    var geos = [];
    data2.forEach(function(p){if (!geos.includes(p["geo"]))geos.push(p["geo"]);});

    data1= data1.filter(function(d,i){return geos.includes(d.properties["NUTS_ID"])});

    data1.forEach(function(d) {
        data2.forEach(function (p) {
            if (d.properties["NUTS_ID"] === p["geo"]) {
                years.forEach(function (year) {
                    if (p[year])
                        d.properties[year] = parseFloat(p[year]);
                });
                if (!d.properties.dens)
                    d.properties.dens = p["dens"];

                if (!d.properties.pop)
                    d.properties.pop = p["pop"];
            }
            if (!unitMesMap[mes])
                if (p['unit'])
                    unitMesMap[mes] = p['unit'];
        });
    });

    return data1;
}


/* ------------------------     fonction qui lit les données de mesure et qui les stocke     -------------------------- */
var geoMes = {};
var mesureMap = {};
var yearsMesureMap = {};
function createMesureData(europe, pesticides, energie, nuclear, taxes,transport, heartdiseases, cancer, motorcars,
                          enerrenouv, fertiNitro, fertiPhos, fertiPota){

    // on appel donc la fonction buildMesureData pour toutes nos données de mesures 
    // pesticides, energie, chauffage nucleaire, taxes, transport, heart diseases, cancer, energie renouvelable, 
    // fertilisants au nitrogene, fertilisants au phosphore, fertilisants au potassium, moteurs petrole et moteurs diesel
    buildMesureData('pe', pesticides, europe);
    buildMesureData('en', energie, europe);
    buildMesureData('cn', nuclear, europe);
    buildMesureData('te', taxes, europe);
    buildMesureData('tr', transport, europe);
    buildMesureData('hd', heartdiseases, europe);
    buildMesureData('c', cancer, europe);
    buildMesureData('enr', enerrenouv, europe);
    buildMesureData('fN', fertiNitro, europe);
    buildMesureData('fPh', fertiPhos, europe);
    buildMesureData('fPo', fertiPota, europe);
    buildMesureData('mvp', motorcars, europe);
    buildMesureData('mvd', motorcars, europe);

    // --> mesureMap et yearsMesureMap sont ainsi remplies et prêtes à être lues
    // on peut donc remplir geoMes

    for (var mesure in mesureMap){
        geoMes[mesure]=[];
        mesureMap[mesure].forEach(function(d){
            geoMes[mesure].push(d.properties["NUTS_ID"]);
        });
    }
}


/* -----------------------     fonction qui filtre les données mesures des valeurs non désirées -----------------------  */
/* ---------------------       on récupère aussi les années disponibles dans le fichier polluant        --------------  */
/* ---------------> cela permet d'afficher des smallMaps sur des années qui sont communes au poluant et a la mesure -- */
function buildMesureData(mes, data, europe){

    var dataRaw = topojson.feature(europe, europe.objects.regions).features;
    var years = [];
    var data1 = JSON.parse(JSON.stringify(dataRaw));

    var dataFiltered;
    switch (mes){
        case "pe":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU15" && d["pe_type"] === "PE_0"});;
            break;
        case "en":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19"});
            break;
        case "cn":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nrg"] === "B_100100"});
            break;
        case "te":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["tax"] === "ENV" && d["unit"] === "MIO_EUR"});
            break;
        case "hd":
            dataFiltered = data.filter(function(d,i){return d["geo"] != "EU15"});
            break;
        case "c":
            dataFiltered = data.filter(function(d,i){return d["geo"] != "EU15"});
            break;
        case "tr":
            dataFiltered = data.filter(function(d,i){return d["geo"] != "EU15"});
            break;
        case "mvd":
            dataFiltered =  data.filter(function(d,i){return d["prod_nrg"] === "DIESEL" && d["engine"] === "TOTAL"});
            break;
        case "mvp":
            dataFiltered =  data.filter(function(d,i){return d["prod_nrg"] === "PETROL" && d["engine"] === "TOTAL"});
            break;
        case "enr":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] != "EU15"});
            break;
        case "fN":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] != "EU15"});
            break;
        case "fPh":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] != "EU15"});
            break;
        case "fPo":
            dataFiltered = data.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] != "EU15"});
            break;
    }

    // une fois la données d'entrée nettoyée, on peut traiter les données et remplir mesureMap + yearsMesureMap
    // yearsMesureMap contient les années pour lesquelles nous avons des données pour chaque mesure

    data1= mergeData(data1,dataFiltered,mes);
    var yearsTmp = Object.keys(dataFiltered[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years.push(d);}});
    mesureMap[mes] = data1;
    yearsMesureMap[mes] = years;
}


/* -------- Création des scales de couleur avec les valeurs min et max  pour chaque polluant et chaque mesure ------------- */
/* ----------> on stocke tous scale de polluants dans la Map colorpol et Idem avec la Map colormes pour les mesures -------*/
var colorpol = {};
var colormes = {};
function updateScalesColor(){
    // ---------------------------------- traitement des données polluants ----------------------------------
    pollutants.forEach(function(pollutant) {

        var pollution=polMap[pollutant];

        var min = Number.MAX_VALUE;
        pollution.forEach(function(pol){
            if (geoPol[pollutant].includes(pol['geo'])){
                for (var key in pol){
                    if (key !== "unit" && key !== "airsect" && key !== "geo" && key !== "airpol" && key !== "dens" && key !== "pop") {
                        //on ne base la scale que s'il y a une densité associé au code NUTS
                        var value = parseFloat(pol[key]) / parseFloat(pol["pop"][key]);
                        if (normalisation === "dens")
                            value = value *  parseFloat(pol["dens"][key]);
                        var year = parseInt(key);
                        if (years.includes(key)) {
                            if (parseFloat(pol[key]) !== 0 && value < parseFloat(min)) {
                                min = value;
                            }
                        }
                    }
                }
            }
        });

        var max = Number.MIN_VALUE;
        pollution.forEach(function(pol){
            if (geoPol[pollutant].includes(pol['geo'])) {
                for (var key in pol) {
                    if (key !== "unit" && key !== "airsect" && key !== "geo" && key !== "airpol" && key !== "dens" && key !== "pop") {
                        //on ne base la scale que s'il y a une densité associé au code NUTS
                        var year = parseInt(key);
                        var value = parseFloat(pol[key]) / parseFloat(pol["pop"][year]);
                        if (normalisation === "dens")
                            value = value *  parseFloat(pol["dens"][year]);
                        if (years.includes(key)) {
                            if (value > parseFloat(max)) {
                                max = value;
                            }
                        }
                    }
                }
            }
        });

        // on ne choisit qu'un seul scale de couleur pour representer les données polluants
        var color = d3.scale.linear().range(['yellow', 'red']);
        color.domain([min,max]);

        colorpol[pollutant] = color;
    });

    var notYearKeys = ["dens", "pop", "sex", "age", "unit","icd10", "airsect", "geo", "airpol","prod_nrg","engine", "indic_nv", "nst07", 
                        "pe_type", "product","indic_nrg", "tax","COUNTRY", "NAME", 'POPULATION', 'NUTS_ID', 'indic_en', 'nutrient'];


    // ----------------------------------- traitement des données mesures -----------------------------------
    mesures.forEach(function(mesure) {

        var mes = mesNameMap[mesure];
        var mesureData=mesureMap[mes];
        var min = Number.MAX_VALUE;

        mesureData.forEach(function(md){
            md = md.properties;
            if (geoMes[mes].includes(md['NUTS_ID'])){
                for (var key in md){
                    if (!notYearKeys.includes(key)) {
                        //var value = parseFloat(md[key]) / parseFloat(md["POPULATION"]);//parseFloat(md["dens"][key]);
                        var value = parseFloat(md[key]) / parseFloat(md["pop"][key])*10000.0;
                        if (normalisation === "dens")
                            value = value *  parseFloat(md["dens"][year]);

                        var year = parseInt(key);
                        if (years.includes(key)) {
                            if (parseFloat(md[key]) !== 0 && value < parseFloat(min)) {
                                min = value;
                            }
                        }
                    }
                }
            }
        });

        var max = Number.MIN_VALUE;
        mesureData.forEach(function(md){
            md = md.properties;
            if (geoMes[mes].includes(md['NUTS_ID'])) {
                for (var key in md) {
                    if (!notYearKeys.includes(key)) {
                        //var value = parseFloat(md[key]) / parseFloat(md["POPULATION"]);//parseFloat(md["dens"][key]);
                        var value = parseFloat(md[key]) / parseFloat(md["pop"][key])*10000.0;
                        if (normalisation === "dens")
                            value = value *  parseFloat(md["dens"][year]);
                        var year = parseInt(key);
                        if (years.includes(key)) {
                            if (value > parseFloat(max)) {
                                max = value;
                            }
                        }
                    }
                }
            }
        });

        var color = d3.scale.linear();

        // contrairement aux polluants, on choisi la couleur de la coloration en fonction de la mesure que l'on traite
        // cela peut aider visuellement
        switch (mes){
            case "pe":
                color.range(['lightgreen', 'darkgreen']);
                break;
            case "en":
                color.range(['lightblue', 'darkblue']);
                break;
            case "cn":
                color.range(['pink', 'magenta']);
                break;
            case "te":
                color.range(['lightgreen', 'darkgreen']);
                break;
            case "hd":
                color.range(['pink', 'purple']);
                break;
            case "c":
                color.range(['pink', 'purple']);
                break;
            case "tr":
                color.range(['pink', 'purple']);
                break;
            case "mvd":
                color.range(['pink', 'darkred']);
                break;
            case "mvp":
                color.range(['pink', 'darkred']);
                break;
            case "enr":
                color.range(['pink', 'darkred']);
                break;
            case "fN":
                color.range(['lightgreen', 'darkgreen']);
                break;
            case "fPh":
                color.range(['lightgreen', 'darkgreen']);
                break;
            case "fPo":
                color.range(['lightgreen', 'darkgreen']);
                break;
        }
        color.domain([min,max]);
        colormes[mes] = color;
    });
}


/* -------------------------------  fonction de mise a jour des smallMultiples de pollution ------------------------------ */
function updatePol() {
    // on récupère la valeur du polluant grace au bouton radio validé
    var choice;
    d3.selectAll(".radiopol").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
        }
    });

    // on met a jour les mesures en fonction de ce polluant grace a la Map de suggestion
    curPol = choice;
    updateMesureDiv(correspondanceMap[curPol]);

    // on récupère la valeur de la mesure grace au bouton radio validé
    var choice2;
    d3.selectAll(".radiomesure").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice2= rb.property("value");
        }
    });

    curMes = mesNameMap[choice2];

    d3.select('#map1title').html('<h4>' +polNameMap[curPol]+ '</h4>');

    data = dataMap[curPol];

    // on a mtn toutes les données nécessaires, on peut donc creer/mettre a jour les fonds de carte des smallMultiples polluants
    var i=0;
    SVGs.each(function(date){

        var map = d3.select(this).selectAll('path')
            .data(data);

        map.enter().append("path")
            .attr({
                "d":path,
                "id":function(d){
                    return d.properties["NUTS_ID"] + date;
                }
            })
            .on('mouseover', function(d){
                tip.show(d,date, true);
                // on affiche au dessus de toutes les smallMap polluant, la valeur pour ce pays --> facilite la vizu de l'évolution des valeurs
                years.forEach(function(year){
                    var value = (parseFloat(d.properties[year])/parseFloat(d.properties["pop"][year])*10000.0).toFixed(4);
                    if (normalisation === "dens")
                        value = value *parseFloat(d.properties["dens"][year]);
                    if(parseFloat(d.properties[year])) {
                        normalisation === 'pop' ? value += ' ' + unitPolMap[curPol] + '/10000 habs' : value = parseInt(value)/10000+' ' + unitPolMap[curPol] + '/10000 habs';
                        d3.select('.title'+year).html(value);
                    }
                    else {
                        d3.select('.title'+year).html("");
                    }
                });
            })
            .on('mouseout', function(d,i){
                tip.hide();
                years.forEach(function(year){
                    d3.select('.title'+year).html(year);
                });
            });

        map.style("fill", function (d) {
            if (!isNaN(d.properties[date])){

                date = parseInt(date);
                approximateDensAndPop(d, date);

                var value = (parseFloat(d.properties[date])/parseFloat(d.properties["pop"][date]));
                if (normalisation === "dens")
                    value = value * parseFloat(d.properties["dens"][date]);

                return colorpol[curPol](value);
            }
            else{
                return "lightgrey";
            }
        });

        map.call(tip);
        map.exit().remove();
        i++;
    });

    // on appelle la MAJ de la légende 
    buildLegend(true);
}


/* ------------------------    fonction de mise a jour de la légende de pollution si isPol == true   ------------------------------ */
/* ------------------------    fonction de mise a jour de la légende des mesures si isPol == false   ------------------------------ */
function buildLegend(isPol){

    var dataUpdate = isPol? [curPol+"1",curPol+"2",curPol+"3",curPol+"4",curPol+"5"] : [curMes+"1",curMes+"2",curMes+"3",curMes+"4",curMes+"5"];
    var idDiv =  isPol ? '#pollegend' : '#meslegend';

    d3.select(idDiv).selectAll(".svglegend").remove();
    var legend = d3.select(idDiv).append("svg").attr("class", "svglegend").selectAll(".legend").data(dataUpdate);
    var unitTab = isPol ? unitPolMap : unitMesMap;
    var curVar = isPol ? curPol : curMes;
    var colorScale = isPol ? colorpol : colormes;

    legend.enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {return "translate("+(30) +"," + ((20) +i * 20) + ")"; })
        .append("circle")
        .attr("r", 5)
        .attr("fill", function(d,i) {
            return colorScale[curVar]((colorScale[curVar].domain()[1]/5)*(i+1));})
        .attr("x", 40);

    legend.append("text")
        .attr("x", 15)
        .attr("dy", ".35em")
        .text(function(d,i) {
            i=i+1;
            if (normalisation === 'pop'){
                if (isPol)
                    return parseInt((colorScale[curVar].domain()[1]*10000/5)*i)+ ' ' + unitTab[curVar] + '/10000 habs';
                else
                    return ((colorScale[curVar].domain()[1]/5)*i).toFixed(4)+' '+unitTab[curVar] + '/10000 habs';
            }
            else{
                if (isPol)
                    return parseInt((colorScale[curVar].domain()[1]*10000/5)*i)/10000 + ' ' + unitTab[curVar] + '/10000 habs';
                else
                    return ((colorScale[curVar].domain()[1]/5)*i).toFixed(4)/10000 + ' ' + unitTab[curVar] + '/10000 habs';
            }
        });

    legend.exit().remove();
}


/* ------------------------    fonction de mise a jour de la légende de pollution si isPol == true   ------------------------------ */
/* ------------------------    fonction de mise a jour des années que l'on veut afficher             ------------------------------ */
// --> le chgmt se fait quand on change de mesure, les polluants faisant tous parti du même fichier de données
// --> les années ne changent pas d'un polluant à un autre, on appelle cette fonction uniquement dans updateMes
function updateDate(){
    d3.selectAll('div.map').remove();

    dateJoin = d3.select('#maps').selectAll('div.map').data(years);
    dateJoin2 = d3.select('#maps2').selectAll('div.map').data(years);

    dateJoin.exit().remove();
    dateJoin2.exit().remove();

    divs = dateJoin.enter().append('div').attr({'id':function(d){ return 'map_'+d; },'class':'map'});
    divs2 = dateJoin2.enter().append('div').attr({'id':function(d){ return 'map2_'+d; },'class':'map'});

    divs.append('p').attr({'class' : function(d){ return 'pmap ' + 'title'+d;}}).text(function(d){ return dateFormat(new Date(d)); });
    divs2.append('p').attr({'class' : function(d){ return 'pmap ' + 'title2'+d;}}).text(function(d){ return dateFormat(new Date(d)); });

    SVGs = divs.append('svg').attr({'width':mapWidth,'height':mapHeight,'class' : 'svgmap'});
    SVGs2 = divs2.append('svg').attr({'width':mapWidth,'height':mapHeight,'class' : 'svgmap'});
    updateScalesColor();
}


/* -----------------------------------  fonction de mise a jour des smallMultiples de mesures ---------------------------------- */
function updateMes(){    
    // on récupère la valeur de la mesure grace au bouton radio validé
    var choice;
    d3.selectAll(".radiomesure").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
        }
    });

    curMes = mesNameMap[choice];
    yearsMes = yearsMesureMap[curMes];
    years = [];

    // on définit les années que le polluant et la mesure choisis ont en commun
    yearPol.forEach(function(d) {
        yearsMes.forEach(function(e) {
            if( d == e ) {
                years.push(d);
            }
        });
    });
    years.reverse();
    years = years.filter(function(year){return parseInt(year) > 1994;});
    years.sort();
    if (years.length > 12) {
        var toSup = years.length - 12;
        years = years.slice(toSup, years.length);
    }
    
    // on change l'affichage des smallMap grace à cet appel de fonction
    updateDate();

    d3.select('#map2title').html('<h4>' +choice+ '</h4>');

    data = mesureMap[curMes];

    // on a mtn toutes les données nécessaires, on peut donc creer/mettre a jour les fonds de carte des smallMultiples mesures
    SVGs2.each(function(date) {
        d3.select(this).selectAll('path').remove();

        var map = d3.select(this).selectAll('path')
            .data(data);

        map.style("fill", function (d) {
            if (!isNaN(d.properties[date])){
                var datebis = date;
                var value = parseFloat(d.properties[date])/parseFloat(d.properties["pop"][datebis]);
                if (normalisation === "dens")
                    value = value * parseFloat(d.properties["dens"][datebis]);
                return colormes[curMes](value);
            }
            else{
                return "lightgrey";
            }
        });

        map.enter().append("path")
            .attr({
                "d": path,
                "class" : "mappath",
                "id": function (d) {
                    return d.properties["NUTS_ID"] + '2' + date;
                }
            }).style("fill", function (d) {
                if (!isNaN(d.properties[date])){
                    var datebis = parseInt(date);

                    approximateDensAndPop(d, datebis);

                    if (d.properties["pop"][datebis] && d.properties[normalisation][datebis]){
                        var value = parseFloat(d.properties[date])/parseFloat(d.properties["pop"][datebis])*10000.0;
                        if (normalisation === "dens")
                            value = value*parseFloat(d.properties["dens"][datebis]);
                        return colormes[curMes](value);
                    }
                    else {
                        return "lightgrey";
                    }
                }
                else{
                    return "lightgrey";
                }
            }).on('mouseover', function(d){
                    tip.show(d,date, false);
                    // on affiche au dessus de toutes les smallMap polluant, la valeur pour ce pays --> facilite la vizu de l'évolution des valeurs
                    years.forEach(function(year){
                        var value = (parseFloat(d.properties[year])/parseFloat(d.properties[normalisation][year])*10000.0).toFixed(4);
                        if(parseFloat(d.properties[year])) {
                            var value2;
                            if (normalisation === 'pop')
                                value2 = (parseFloat(d.properties[year])/parseFloat(d.properties["pop"][year])*10000.0).toFixed(4) + ' ' + unitMesMap[curMes] + '/10000 habs';
                            else
                                value2 = (parseFloat(d.properties[year])/parseFloat(d.properties["pop"][year])*parseFloat(d.properties["dens"][year])).toFixed(4) + ' ' + unitMesMap[curMes] + '/10000 habs';
                            d3.select('.title2'+year).html(value2);
                        }
                        else {
                            d3.select('.title2'+year).html("");
                        }
                    });
                })
              .on('mouseout', function(d,i){
                  tip.hide();
                  years.forEach(function(year){
                      d3.select('.title2'+year).html(year);
                  });
              });

        map.exit().remove();
    });

    // on appelle la MAJ de la légende 
    buildLegend(false);
}

//fonction trick pour approximer la densité ou la démographie quand les données sont manquantes
function approximateDensAndPop(d, datebis){
    if (!d.properties["dens"][datebis]){
        console.log(datebis);

        for (var i=1; i<=10; i++){
            if(d.properties["dens"][datebis+i]){
                d.properties["dens"][datebis] = d.properties["dens"][datebis+i];
                break;
            }
            else if (d.properties["dens"][datebis-i]){
                d.properties["dens"][datebis] = d.properties["dens"][datebis-i];
                break;
            }
        }
    }

    if (!d.properties["pop"][datebis]){
        for (var i=1; i<=10; i++){
            if(d.properties["pop"][datebis+i]){
                d.properties["pop"][datebis] = d.properties["pop"][datebis+i];
                break;
            }
            else if (d.properties["pop"][datebis-i]){
                d.properties["pop"][datebis] = d.properties["pop"][datebis-i];
                break;
            }
        }
    }
}

/* -  fonction qui ajoute dans nos map de stockage des données polluant/mesure, les valeurs de démographie et de densité -- */
function insertDataAttribute(data1, data2, attribute){
    data2.forEach(function(d){
        if (!d[attribute])
            d[attribute]={};
        if (d["geo"] === data1["geo"]){
            years.forEach(function(year){
                if (d[year]){
                    if (data1[year] !== ":")
                        d[attribute][year]= data1[year];
                }
            });
        }
    });
}


/* ----------------------------------------------------  fonction initiale ----------------------------------------------------  */
function init(error,pollutions,density, population, pesticides, energie, nuclear, taxes,
              transport, heartdiseases, cancer, motorcars, enerrenouv, fertiNitro, fertiPhos, fertiPota, europe){

    if (error) throw error;

    // on crée un vecteur contenant tous nos parametres 
    // --> facile à manipuler pour normaliser les données en fcn de la population et de la densité
    var dataMesures = [pollutions,pesticides,energie,nuclear,taxes,transport,heartdiseases,cancer,motorcars,enerrenouv,fertiNitro,fertiPhos,fertiPota];

    // on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    density.forEach(function(dens){
        dataMesures.forEach(function(dataM){insertDataAttribute(dens,dataM,'dens');});
    });

    // on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    population.forEach(function(pop){
        dataMesures.forEach(function(dataM){insertDataAttribute(pop,dataM,'pop');});
    });

    // on créé le div du choix de normalisation
    createNormaDiv();

    // on créé le div des polluants
    createPolDiv(pollutions);

    // on créé dynamiquement le div des mesures
    createMesureDiv();

    // on récupère la liste pollution en fonction du polluant (radio bouton) choisi
    createPolDatas(pollutions);

    // on intègre les données de pollution aux données de map
    createMergedPolAndMapData(europe);

    // on créé des variables globales pour les données des mesures
    createMesureData(europe, pesticides, energie, nuclear, taxes, transport, heartdiseases,
        cancer, motorcars, enerrenouv, fertiNitro, fertiPhos, fertiPota);

    // on affiche les smallMultiples de mesure et de pollution (les mesures avant pour ne pas avoir a faire une MAJ de l'affichage des map polluants)
    updateMes();
    updatePol();
}


queue()
    //les emissions de pollutions dans l'air ( = le référentiel : contient tous nos polluants )
    .defer(d3.tsv, "data/eurostats/clean/env_air_emission.tsv")
    //les données sur la densité pour la normalisation des scales
    .defer(d3.tsv, "data/eurostats/clean/demo_r_d3dens.tsv")
    //les données sur la population pour la normalisation des scales
    .defer(d3.tsv, "data/eurostats/clean/demo_r_d2jan.tsv")
    //les pesticides de 80 à 2008
    .defer(d3.tsv, "data/eurostats/clean/pesticides_sales2.tsv")
    //production d'energie 
    .defer(d3.csv, "data/eurostats/clean/production_energy.csv")
    //les donnees du chauffage nucleaire
    .defer(d3.csv, "data/eurostats/clean/nuclear_heat.csv")
    //les donnees des taxes sur l'environnement
    .defer(d3.csv, "data/eurostats/clean/env_ac_taxes.csv")
    //les donnees du transport
    .defer(d3.csv, "data/eurostats/clean/road_go_na_rl3g_transport2.csv")
    //les donnees du chauffage nucleaire
    .defer(d3.csv, "data/eurostats/clean/tgs00059_ischaemic_heart_diseases2.csv")
    //les donnees des morts de cancer
    .defer(d3.csv, "data/eurostats/clean/tgs00058_cancer2.csv")
    //les donnees de moteurs de voiture
    .defer(d3.csv, "data/eurostats/clean/type_of_motor_cars.csv")
    //les energies renouvelables
    .defer(d3.tsv, "data/eurostats/clean/tsdcc330.tsv")
    //les donnees de fetilisants au nitrogen
    .defer(d3.csv, "data/eurostats/clean/nitrogen.csv")
    //les donnees de fertilisants au phosphore
    .defer(d3.csv, "data/eurostats/clean/phosphore.csv")
    //les donnees de fertilisants au potassium
    .defer(d3.csv, "data/eurostats/clean/potassium.csv")
    //la map de l'europe
    .defer(d3.json,"geodata/euro/eurotopo.json")
    .await(init);

