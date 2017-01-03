//-------------------------------------------- IDEES --------------------------------------------

// ----------- SUPER UTILE -----------
//TODO utiliser la densité? comment? pour ajuster quelles valeurs?
//TODO plus de données et exploiter plus les données
//TODO trouver les bonnes suggestions
//TODO changer position div mesure --> fonction du nombre de map cad 2 lignes de maps = bien placé sinon autant il faut le descendre d'autant de lignes de map en plus des 2 premieres
//TODO optimiser et nettoyer le code


// ----------- AMELIORATION -----------
//TODO améliorer la légende
//TODO faire du design, sur le panneau de droite notamment


// ----------- OPTIMISATION -----------
//TODO faire des graphiques quand on selectionne une region?
//TODO zoom sur les cartes?

//le polluant/mesure courant(e) sélectionné(e)
var curPol = "NH3";
var curMes = "c";
var normalisation = "pop";

//Les unités des différent(e)s polluants/mesures
var unitPolMap = {};
var unitMesMap = {};

//Les dimensions d'une small map
var mapWidth = 230;
var mapHeight = 180;

//Les conteneurs des maps
var dateJoin,divs,SVGs;
var dateJoin2,divs2,SVGs2;

//projection + path de l'europe d'une small map
var projection = d3.geo.stereographic().center([3.9,43.0]).scale(375).translate([mapWidth / 2-20, mapHeight / 2+43]);

var path = d3.geo.path().projection(projection);

var dateFormat = d3.time.format("%Y");

//les années choisies (une map par année)
var years = ["1995","1996","1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014"];

var polNameMap = {'NH3' : 'Ammoniac', 'NMVOC' : 'Composés volatiles organiques', 'NOX' : 'Oxyde d\'azote',
                  'PM10' : 'Particules 10μm', 'PM2_5': 'Particules 2.5μm', 'SOX' : 'Oxyde de soufre'};

var correspondanceMap = {'NH3' : ['Pesticides','Fertilisants au Nitrogene','Fertilisants au Phosphore','Fertilisants au Potassium'/*,
                                  'Morts de cancers','Morts de maladies cardiaques','Taxes environnementales','Production d\'énergie,
                                  'Chauffage Nucleaire','Taxe transport','Moteurs de voitures'*/],
                         'NMVOC' : ['Moteurs de voitures pétrole','Energie renouvelable','Morts de cancers','Morts de maladies cardiaques'/*, 
                                    /*,'Taxes environnementales','Production d\'énergie'','Chauffage Nucleaire','Taxe transport','Pesticides','Moteurs de voitures'*/],
                         'NOX' : ['Chauffage Nucleaire','Moteurs de voitures pétrole','Production d\'énergie'/*,'Moteurs de voitures','Taxe transport',
                                  'Morts de cancers','Morts de maladies cardiaques','Pesticides','Taxes environnementales'*/],
                         'PM10' : ['Taxes environnementales','Taxe transport','Morts de cancers','Morts de maladies cardiaques',
                                    /*'Moteurs de voitures diesel','Production d\'énergie','Pesticides','Chauffage Nucleaire','Moteurs de voitures'*/],
                         'PM2_5' : ['Moteurs de voitures diesel','Taxe transport','Morts de cancers','Morts de maladies cardiaques'/*,
                                    'Taxes environnementales','Production d\'énergie','Chauffage Nucleaire','Pesticides'*/],
                         'SOX' : ['Chauffage Nucleaire','Production d\'énergie'/*,'Pesticides','Morts de cancers','Morts de maladies cardiaques',
                                  'Taxes environnementales','Taxe transport','Moteurs de voitures'*/]
                        };

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


function getNameFromMesCode(mesCode){
    for (var mesure in mesuresCodes){
        if (mesuresCodes[mesure] === mesCode)
            return mesure;
    }
}

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d,date, isPol) {
        var name = d.properties["NAME"];
        var name = regionNameMap[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()];
        var toDisplay = name +'</br>';
        return toDisplay;
    });

/* -------------------------- fonction pour créer le div du choix de la normalisation des données -------------------------- */
var choiceNorma = ['normaliser par densité', 'normaliser par population'];
function createNormaDiv() {
    var fieldset = d3.select("#normalisationdiv").append("form").attr('class',"normalegend");
    fieldset.append("legend").html(
        '<h5>Choix de la normalisation :</h5>'+
        '<span class="radio">' +
        '<input type="radio" name = "choice" class ="choice" id="radPop" value="pop" checked>' +
        '<label class ="radiolabel">Population</label>' +
        '</span>'+ //'</br>'+
        '<span class="radio">' +
        '<input type="radio" name = "choice" class ="choice" id="radDens" value="dens">' +
        '<label class ="radiolabel">Densité</label>' +
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
var mesures = ['Morts de cancers','Pesticides', 'Production d\'énergie', 'Chauffage Nucleaire', 'Taxes environnementales','Taxe transport', 
                'Morts de maladies cardiaques',  'Moteurs de voitures diesel','Energie renouvelable', 'Moteurs de voitures pétrole',
                'Fertilisants au Nitrogene','Fertilisants au Phosphore','Fertilisants au Potassium'];
var mesuresCodes = {'Pesticides' : 'pe', 'Production d\'énergie':'en', 'Chauffage Nucleaire' :'cn', 'Taxes environnementales' : 'te',
                    'Taxe transport' : 'tr', 'Morts de maladies cardiaques':'hd', 'Morts de cancers' : 'c',
                    'Moteurs de voitures diesel' : 'mvd', 'Moteurs de voitures pétrole' : 'mvp', 'Energie renouvelable' : 'enr',
                    'Fertilisants au Nitrogene' : 'fN','Fertilisants au Phosphore' : 'fPh','Fertilisants au Potassium' : 'fPo'};
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
            value : function(d,i) { return mesuresCodes[d];}
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
            value : function(d,i) { return mesuresCodes[d];}
        })
        .property({
            checked: function(d,i) {return (mesuresCodes[d] === curMes); },
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
        curMes = mesuresCodes[d3.selectAll(".radiomesure")[0][0].value];
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

/* ------------------ fonction pour un dataset contenant les données de map + du polluant courant sélectionné ------------------ */
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

function mergeData(data1,data2,mes){
    /* data1 = donnees polluants */
    /* data2 = donnees correlation */
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


/* ------------------------------------ Mapping des donnees de correlation pour le stockage ------------------------------------ */
/* ------------------------------ on récupère ici les années disponibles dans le fichier polluant ------------------------------ */
var geoMes = {};
var mesureMap = {};
var yearsMesureMap = {};
function createMesureData(europe, pesticides, energie, nuclear, taxes,transport, heartdiseases, cancer, motorcars,
                          enerrenouv, fertiNitro, fertiPhos, fertiPota){

    var dataRaw = topojson.feature(europe, europe.objects.regions).features;

    //pesticides
    var years1 = [];
    var data1 = JSON.parse(JSON.stringify(dataRaw));
    var pesticides2 = pesticides.filter(function(d,i){return d["geo"] !== "EU15" && d["pe_type"] === "PE_0"});
    data1= mergeData(data1,pesticides2,'pe');
    var yearsTmp = Object.keys(pesticides2[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years1.push(d);}});
    mesureMap['pe'] = data1;
    yearsMesureMap['pe'] = years1;

    //energie
    var years2 = [];
    var data2 = JSON.parse(JSON.stringify(dataRaw));
    var energie2 = energie.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nv"] === "FEC_TOT"});
    data2= mergeData(data2,energie2,'en');
    yearsTmp = Object.keys(energie2[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years2.push(d);}});
    mesureMap['en'] = data2;
    yearsMesureMap['en'] = years2;

    //chauffage nucleaire
    var years3 = [];
    var data3 = JSON.parse(JSON.stringify(dataRaw));
    var nuclear2 = nuclear.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nrg"] === "B_100100"});
    data3 = mergeData(data3,nuclear2,'cn');
    yearsTmp = Object.keys(nuclear2[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years3.push(d);}});
    mesureMap['cn'] = data3;
    yearsMesureMap['cn'] = years3;

    //taxes
    var years4 = [];
    var data4 = JSON.parse(JSON.stringify(dataRaw));
    var taxes2 = taxes.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["tax"] === "ENV" && d["unit"] === "MIO_EUR"});
    data4 = mergeData(data4,taxes2,'te');
    yearsTmp = Object.keys(taxes2[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years4.push(d);}});
    mesureMap['te'] = data4;
    yearsMesureMap['te'] = years4;

    //transport
    var years6 = [];
    var data6 = JSON.parse(JSON.stringify(dataRaw));
    var transport2 = transport.filter(function(d,i){return d["geo"] != "EU15"});
    data6 = mergeData(data6,transport2,'tr');
    yearsTmp = Object.keys(transport2[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years6.push(d);}});
    mesureMap['tr'] = data6;
    yearsMesureMap['tr'] = years6;

    //heart diseases
    var years7 = [];
    var data7 = JSON.parse(JSON.stringify(dataRaw));
    data7 = mergeData(data7,heartdiseases, 'hd');
    yearsTmp = Object.keys(heartdiseases[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years7.push(d);}});
    mesureMap['hd'] = data7;
    yearsMesureMap['hd'] = years7;

    //cancer
    var years8 = [];
    var data8 = JSON.parse(JSON.stringify(dataRaw));
    data8 = mergeData(data8,cancer, 'c');
    yearsTmp = Object.keys(cancer[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years8.push(d);}});
    mesureMap['c'] = data8;
    yearsMesureMap['c'] = years8;

    //motor cars
    var years9 = [];
    var data9 = JSON.parse(JSON.stringify(dataRaw));
    var motorcars2 = motorcars.filter(function(d,i){return d["prod_nrg"] === "DIESEL" && d["engine"] === "TOTAL"});
    yearsTmp = Object.keys(motorcars[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years9.push(parseInt(d));}});
    data9 = mergeData(data9,motorcars2, 'mvd');
    mesureMap['mvd'] = data9;
    yearsMesureMap['mvd'] = years9;
    var motorcars3 = motorcars.filter(function(d,i){return d["prod_nrg"] === "PETROL" && d["engine"] === "TOTAL"});
    var data92 = mergeData(data9,motorcars3, 'mvp');
    mesureMap['mvp'] = data92;
    yearsMesureMap['mvp'] = years9;

    //energie renouvelable
    var years10 = [];
    var data10 = JSON.parse(JSON.stringify(dataRaw));
    yearsTmp = Object.keys(enerrenouv[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years10.push(parseInt(d));}});
    data10 = mergeData(data10,enerrenouv, 'enr');
    mesureMap['enr'] = data10;
    yearsMesureMap['enr'] = years10;

    //fertilisants au nitrogene
    var years11 = [];
    var data11 = JSON.parse(JSON.stringify(dataRaw));
    yearsTmp = Object.keys(fertiNitro[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years11.push(parseInt(d));}});
    data11 = mergeData(data11,fertiNitro, 'fN');
    mesureMap['fN'] = data11;
    yearsMesureMap['fN'] = years11;

    //fertilisants au phosphore
    var years12 = [];
    var data12 = JSON.parse(JSON.stringify(dataRaw));
    yearsTmp = Object.keys(fertiPhos[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years12.push(parseInt(d));}});
    data12 = mergeData(data12,fertiPhos, 'fPh');
    mesureMap['fPh'] = data12;
    yearsMesureMap['fPh'] = years12;

    //fertilisants au potassium
    var years13 = [];
    var data13 = JSON.parse(JSON.stringify(dataRaw));
    yearsTmp = Object.keys(fertiPota[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years13.push(parseInt(d));}});
    data13 = mergeData(data13,fertiPota, 'fPo');
    mesureMap['fPo'] = data13;
    yearsMesureMap['fPo'] = years13;

    for (var mesure in mesureMap){
        geoMes[mesure]=[];
        mesureMap[mesure].forEach(function(d){
            geoMes[mesure].push(d.properties["NUTS_ID"]);
        });
    }
}


// ------------------------------- Création des scales de couleur avec les valeurs min et max -------------------------------
var colorpol = {};
var colormes = {};
/* fonction qui créé les scales de couleurs pour chaque polluant puis pour chaque mesures en fonction des min et max*/
function updateScalesColor(){
    colorpol = {};
    colormes = {};

    pollutants.forEach(function(pollutant){

        var pollution=polMap[pollutant];

        var min = Number.MAX_VALUE;
        pollution.forEach(function(pol){
            if (geoPol[pollutant].includes(pol['geo'])){
                for (var key in pol){
                    if (key !== "unit" && key !== "airsect" && key !== "geo" && key !== "airpol" && key !== "dens" && key !== "pop") {
                        //on ne base la scale que s'il y a une densité associé au code NUTS
                        var value = parseFloat(pol[key]) / parseFloat(pol[normalisation][key]);
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
                        var value = parseFloat(pol[key]) / parseFloat(pol[normalisation][year]);
                        if (years.includes(key)) {
                            if (value > parseFloat(max)) {
                                max = value;
                            }
                        }
                    }
                }
            }
        });

        var color = d3.scale.linear().range(['yellow', 'red']);
        color.domain([min,max]);

        colorpol[pollutant] = color;
    });

    var notYearKeys = ["dens", "pop", "sex", "age", "unit","icd10", "airsect", "geo", "airpol",
                       "prod_nrg","engine", "indic_nv", "nst07", "pe_type", "product","indic_nrg", "tax",
                        "COUNTRY", "NAME", 'POPULATION', 'NUTS_ID', 'indic_en', 'nutrient',
                        ];

    mesures.forEach(function(mesure){
        var mes = mesuresCodes[mesure];

        var mesureData=mesureMap[mes];

        var min = Number.MAX_VALUE;

        mesureData.forEach(function(md){
            md = md.properties;
            if (geoMes[mes].includes(md['NUTS_ID'])){
                for (var key in md){
                    if (!notYearKeys.includes(key)) {
                        //var value = parseFloat(md[key]) / parseFloat(md["POPULATION"]);//parseFloat(md["dens"][key]);
                        var value = parseFloat(md[key]) / parseFloat(md[normalisation][key])*10000.0;
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
                        var value = parseFloat(md[key]) / parseFloat(md[normalisation][key])*10000.0;
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

/* fonction de mise a jour des smallMultiples de pollution */
function updatePol() {
    var choice;
    d3.selectAll(".radiopol").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
        }
    });

    curPol = choice;

    updateMesureDiv(correspondanceMap[curPol]);

    var choice2;
    d3.selectAll(".radiomesure").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice2= rb.property("value");
        }
    });

    curMes = mesuresCodes[choice2];

    d3.select('#map1title').html('<h4>' +polNameMap[curPol]+ '</h4>');

    data = dataMap[curPol];

    //création des fonds de carte des smallMultiples
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
                years.forEach(function(year){
                    var value = (parseFloat(d.properties[year])/parseFloat(d.properties[normalisation][year])*10000.0).toFixed(4);
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
                //WATCHOUT Statique on remplace la densité de 2001 par celle de 2000
                // et celle de 2004 par celle de 2003 car données manquantes #empirisme
                var datebis = date;
                if (datebis === "2001")datebis = "2000";
                if (datebis === "2004")datebis = "2003";

                var value = (parseFloat(d.properties[date])/parseFloat(d.properties[normalisation][date]));
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

    // La légende
    buildLegend(true);
}

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
            i=i+1;
            return colorScale[curVar]((colorScale[curVar].domain()[1]/5)*i);})
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

/* fonction de mise a jour des dates */
function updateDate(){

    //d3.selectAll('.maptitle').remove();
    d3.selectAll('div.map').remove();

    //d3.select("#maps").append("h4").attr("id", "maptitle").attr("class", "maptitle");
    //d3.select("#maps2").append("h4").attr("id", "map2title").attr("class", "maptitle");

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

/* fonction de mise a jour des smallMultiples de mesure */
function updateMes(){
    var choice;
    d3.selectAll(".radiomesure").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
        }
    });

    curMes = mesuresCodes[choice];
    yearsMes = yearsMesureMap[curMes];
    years = [];

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
    
    updateDate();

    d3.select('#map2title').html('<h4>' +choice+ '</h4>');

    data = mesureMap[curMes];

    SVGs2.each(function(date) {
        d3.select(this).selectAll('path').remove();

        var map = d3.select(this).selectAll('path')
            .data(data);

        map.style("fill", function (d) {
            if (!isNaN(d.properties[date])){
                var datebis = date;
                var value = parseFloat(d.properties[date])/parseFloat(d.properties[normalisation][datebis]);
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
                    //console.log(d.properties["NUTS_ID"]);
                    return d.properties["NUTS_ID"] + '2' + date;
                }
            }).style("fill", function (d) {
                if (!isNaN(d.properties[date])){

                    var datebis = date;

                    var datebis = parseInt(datebis);
                    if (!d.properties[normalisation][datebis]){
                        for (var i=1; i<=10; i++){
                            if(d.properties[normalisation][datebis+i]){
                                d.properties[normalisation][datebis] = d.properties[normalisation][datebis+i];
                                break;
                            }
                            else if (d.properties[normalisation][datebis-i]){
                                d.properties[normalisation][datebis] = d.properties[normalisation][datebis-i];
                                break;
                            }
                        }
                    }

                    if (d.properties[normalisation][datebis]){
                        var value = parseFloat(d.properties[date])/parseFloat(d.properties[normalisation][datebis])*10000.0;
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
                    years.forEach(function(year){
                        var value = (parseFloat(d.properties[year])/parseFloat(d.properties[normalisation][year])*10000.0).toFixed(4);
                        if(parseFloat(d.properties[year])) {
                            var value2;
                            if (normalisation === 'pop')
                                value2 = (parseFloat(d.properties[year])/parseFloat(d.properties[normalisation][year])*10000.0).toFixed(4) + ' ' + unitMesMap[curMes] + '/10000 habs';
                            else
                                value2 = (parseFloat(d.properties[year])/parseFloat(d.properties[normalisation][year])).toFixed(4) + ' ' + unitMesMap[curMes] + '/10000 habs';
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

    buildLegend(false);
}

function insertDataAttribute(data1, data2, attribute){
    data2.forEach(function(d){
        if (!d[attribute])
            d[attribute]={};
        if (d["geo"] === data1["geo"]){
            years.forEach(function(year){
                if (d[year])
                    d[attribute][year]= data1[year];
            });
        }
    });
}

function init(error,pollutions,density, population, pesticides, energie, nuclear, taxes,
              transport, heartdiseases, cancer, motorcars, animals, enerrenouv, fertiNitro, fertiPhos, fertiPota, europe){

    if (error) throw error;

    //on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    var dataMesures = [pollutions,pesticides,energie,nuclear,taxes,transport,
        heartdiseases,cancer,motorcars,enerrenouv,fertiNitro,fertiPhos,fertiPota];

    density.forEach(function(dens){
        dataMesures.forEach(function(dataM){insertDataAttribute(dens,dataM,'dens');});
    });

    //on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    population.forEach(function(pop){
        dataMesures.forEach(function(dataM){insertDataAttribute(pop,dataM,'pop');});
    });

    //on créé le div du choix de normalisation
    createNormaDiv();

    //on créé le div des polluants
    createPolDiv(pollutions);

    //on créé dynamiquement le div des mesures
    createMesureDiv();

    //On récupère la liste pollution en fonction du polluant (radio bouton) choisi
    createPolDatas(pollutions);

    //on intègre les données de pollution aux données de map
    createMergedPolAndMapData(europe);

    //on créé des variables globales pour les données des mesures
    createMesureData(europe, pesticides, energie, nuclear, taxes, transport, heartdiseases,
        cancer, motorcars, enerrenouv, fertiNitro, fertiPhos, fertiPota);

    //on affiche les smallMultiples de mesure
    updateMes();

    //on affiche les smallMultiples de pollution
    updatePol();
}


// permet de charger les fichiers de manière asynchrone
queue()
    //les emissions de pollutions dans l'air (le référentiel quoi)
    .defer(d3.tsv, "data/eurostats/clean/env_air_emission.tsv")
    //les données sur la densité pour la normalisation des scales
    .defer(d3.tsv, "data/eurostats/clean/demo_r_d3dens.tsv")
    //les données sur la population pour la normalisation des scales
    .defer(d3.tsv, "data/eurostats/clean/demo_r_d2jan.tsv")
    //les pesticides de 80 à 2008
    .defer(d3.tsv, "data/eurostats/clean/pesticides_sales2.tsv")
    //production d'energie par secteur
    .defer(d3.csv, "data/eurostats/clean/env_rpep2.csv")
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
    //la population animale
    .defer(d3.csv, "data/eurostats/clean/agr_r_animal.tsv")
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

