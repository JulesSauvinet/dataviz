//IDEES
//demographie ou densité?

//TODO optimiser et nettoyer le code
//TODO améliorer la légende
//TODO faire du design, sur le panneau de droite notamment
//TODO faire des graphiques quand on selectionne une region?
//TODO zoom sur les cartes?
//TODO changer years en fonction des données
//TODO suggestions
//TODO plus de données et exmploiter plus les données
//TODO changer scales de couleur quand on change les years
//TODO valeur a la place de year quand on hoove


//NOT USED mais eventuellement la taille de la vizu
var width = 1550, height = 800;

//le polluant courant sélectionné
var curPol = "NH3";
var curMes = "c";
var unitPolMap = {};
var unitMesMap = {};

//la taille d'une small map
var mapWidth = 230;
var mapHeight = 180;

//projection + path de l'europe d'une small map
var projection = d3.geo.stereographic().center([3.9,43.0]).scale(375).translate([mapWidth / 2-20, mapHeight / 2+43]);

var path = d3.geo.path()
    .projection(projection);

var dateFormat = d3.time.format("%Y");

//les années choisies (une map par année)
var years = ["2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014"];

var polNameMap = {'NH3' : 'Ammoniac', 'NMVOC' : 'Composés volatiles organiques', 'NOX' : 'Oxyde d\'azote',
                  'PM10' : 'Particules 10', 'PM2_5': 'Particules 2.5', 'SOX' : 'Oxyde de soufre'};


var correspondanceMap = {'NH3' : ['Pesticides','Morts de cancers','Taxes environnementales','Energie',
                                  'Chauffage Nucleaire','Morts de maladies cardiaques'/*,'Transport','Moteurs de voitures'*/],
                         'NMVOC' : ['Morts de cancers','Morts de maladies cardiaques'/*,
                                    'Taxes environnementales','Energie','Chauffage Nucleaire','Transport','Pesticides','Moteurs de voitures'*/],
                         'NOX' : ['Chauffage Nucleaire','Energie'/*,'Moteurs de voitures','Transport',
                                  'Morts de cancers','Morts de maladies cardiaques','Pesticides','Taxes environnementales'*/],
                         'PM10' : ['Taxes environnementales','Energie','Transport','Morts de cancers',
                                   'Morts de maladies cardiaques'/*,'Pesticides','Chauffage Nucleaire','Moteurs de voitures'*/],
                         'PM2_5' : ['Moteurs de voitures','Transport','Morts de cancers','Morts de maladies cardiaques'/*,
                                    'Taxes environnementales','Energie','Chauffage Nucleaire','Pesticides'*/],
                         'SOX' : ['Chauffage Nucleaire','Energie','Pesticides','Morts de cancers','Morts de maladies cardiaques'/*,
                                  'Taxes environnementales','Transport','Moteurs de voitures'*/]
                        };

d3.select("#maps").append("h4").attr("id", "maptitle").attr("class", "maptitle");
d3.select("#maps2").append("h4").attr("id", "map2title").attr("class", "maptitle");

//on dessine une map pour chaque année pour la pollution

var dateJoin = d3.select('#maps').selectAll('div.map').data(years);
dateJoin.exit().remove();

var divs = dateJoin.enter()
    .append('div').attr({
        'id':function(d){ return 'map_'+d; },
        'class':'map'
    });

divs.append('p').attr({'class' : function(d){ return 'pmap ' + 'title'+d;}}).text(function(d){ return dateFormat(new Date(d)); });

//le titre -> nom de l'année
var SVGs = divs.append('svg').attr({
    'width':mapWidth,
    'height':mapHeight,
    'class' : 'svgmap'
});

//on dessine une map pour chaque année pour les mesures
var dateJoin2 = d3.select('#maps2').selectAll('div.map').data(years);
dateJoin2.exit().remove();

var divs2 = dateJoin2.enter()
    .append('div').attr({
        'id':function(d){ return 'map2_'+d; },
        'class':'map'
    });

divs2.append('p').attr({'class' : function(d){ return 'pmap ' + 'title2'+d;}}).text(function(d){ return dateFormat(new Date(d)); });

//le titre -> nom de l'année
var SVGs2 = divs2.append('svg').attr({
    'width':mapWidth,
    'height':mapHeight,
    'class' : 'svgmap'
});

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
        var toDisplay =  'Région :  ' +  d.properties["NAME"] +'</br>';
        /*if (isPol)
            toDisplay+='Pollution en ' + polNameMap[curPol] +' : ' + parseInt(parseFloat(d.properties[date])/parseFloat(d.properties['pop'][date])*10000.0) + unitPolMap[curPol] + '/10000 habs';
        else{
            var unit = '??';
            if (unitMesMap[curMes])
                unit = unitMesMap[curMes];
            if (!isNaN(parseFloat(d.properties[date])))
                toDisplay+=getNameFromMesCode(curMes) + ' : ' + (parseFloat(d.properties[date])/parseFloat(d.properties['pop'][date])*1000.0).toFixed(4) + unit + '/1000 habs';
            else
                toDisplay+=getNameFromMesCode(curMes) + ' : ND';
        }*/

        return toDisplay;
    });

//TODO UN SEUL DATA?
var pollutants = [];
/* ----------------------------- fonction pour créer le div des polluants de manière dynamique ----------------------------- */
function createPolDiv(pollutions){
    pollutions.forEach(function(p){
        if (!pollutants.includes(p.airpol)) {
            pollutants.push(p.airpol);
        }
    });

    var fieldset = d3.select("#pollutiondiv").append("form");
    fieldset.append("legend").html("<h4>Choix du polluant</h4>");
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
}

/* ----------------------------- fonction pour créer le div des mesures de manière dynamique ----------------------------- */
var mesures = ['Morts de cancers','Pesticides', 'Energie', 'Chauffage Nucleaire', 'Taxes environnementales','Transport', 'Morts de maladies cardiaques',  'Moteurs de voitures'];
var mesuresCodes = {'Pesticides' : 'pe', 'Energie':'en', 'Chauffage Nucleaire' :'cn', 'Taxes environnementales' : 'te',
                    'Transport' : 'tr', 'Morts de maladies cardiaques':'hd', 'Morts de cancers' : 'c', 'Moteurs de voitures' : 'mv'};
var fieldset,radioSpan;
function createMesureDiv(mesuresTmp) {
    fieldset = d3.select("#mesurediv").append("form");
    fieldset.append("legend").html("<h4>Choix de la mesure</h4>");
    radioSpan = fieldset.selectAll(".radio").data(mesuresTmp);

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
            value: function(d) { return d }
        });

    radioSpan.append("label")
        .attr('class', 'radiolabel')
        .html(function(d, i) {  return d.last == true ? d :  d + '<br>'});
    //radioSpan.exit().remove();
}

function updateMesureDiv(mesures) {
    //radioSpan.exit().remove();
    radioSpan.selectAll(".radio").remove();

    radioSpan = fieldset.selectAll(".radio").data(mesures);

    var rad = radioSpan.enter().append("span")
        .attr("class", "radio");

    rad.append("input")
        .attr({
            type: "radio",
            name: "mesure",
            class : "radiomesure",
            id : function(d,i) { return 'mesureradio' + i;},
            value : function(d,i) { return mesuresCodes[d];}
        })
        .property({
            checked: function(d,i) { return (i ===0); },
            value: function(d) { return d }
        });

    rad.append("label")
        .attr('class', 'radiolabel')
        .html(function(d, i) {  return d.last == true ? d :  d + '<br>'});

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=mesure]")
        .on("change", function() {
            updateMes();
            updatePol();
        });

    radioSpan.exit().remove();
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

    //console.log(mes);

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
//TODO centraliser les données pour optimiser le stockage?
var geoMes = {};
var mesureMap = {};
var yearsMesureMap = {};
function createMesureData(europe, pesticides, energie, nuclear, taxes,
                          transport, heartdiseases, cancer, motorcars){

    var dataRaw = topojson.feature(europe, europe.objects.regions).features;

    //pesticides
    var years1 = [];
    var data1 = JSON.parse(JSON.stringify(dataRaw));
    pesticides.filter(function(d,i){return d["geo"] !== "EU15" && d["pe_type"] === "PE_1"});
    data1= mergeData(data1,pesticides,'pe');
    var yearsTmp = Object.keys(pesticides[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years1.push(d);}});
    mesureMap['pe'] = data1;
    yearsMesureMap['pe'] = years1;

    //energie
    var years2 = [];
    var data2 = JSON.parse(JSON.stringify(dataRaw));
    energie.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nv"] === "FEC_TOT"});
    data2= mergeData(data2,energie,'en');
    yearsTmp = Object.keys(energie[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years2.push(d);}});
    mesureMap['en'] = data2;
    yearsMesureMap['en'] = years2;

    //chauffage nucleaire
    var years3 = [];
    var data3 = JSON.parse(JSON.stringify(dataRaw));
    nuclear.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nrg"] === "B_100100"});
    data3 = mergeData(data3,nuclear,'cn');
    yearsTmp = Object.keys(nuclear[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years3.push(d);}});
    mesureMap['cn'] = data3;
    yearsMesureMap['cn'] = years3;

    //taxes
    var years4 = [];
    var data4 = JSON.parse(JSON.stringify(dataRaw));
    taxes.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["tax"] === "ENV"});
    data4 = mergeData(data4,taxes,'te');
    yearsTmp = Object.keys(taxes[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years4.push(d);}});
    mesureMap['te'] = data4;
    yearsMesureMap['te'] = years4;

    //transport
    var years6 = [];
    var data6 = JSON.parse(JSON.stringify(dataRaw));
    transport.filter(function(d,i){return d["geo"] != "EU15"});
    data6 = mergeData(data6,transport,'tr');
    yearsTmp = Object.keys(transport[0]);
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
    motorcars.filter(function(d,i){return d["prod_nrg"] === "TOTAL" && d["engine"] === "TOTAL"});
    yearsTmp = Object.keys(motorcars[0]);
    yearsTmp.forEach(function(d) {if(parseInt(d)) {years9.push(parseInt(d));}});
    data9 = mergeData(data9,motorcars, 'mv');
    mesureMap['mv'] = data9;
    yearsMesureMap['mv'] = years9;

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
/* fonction qui créé les scales de couleurs pour chaque polluant 
puis pour chaque mesures en fonction des min et max (appelé une seule fois) */
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
                        var value = parseFloat(pol[key]) / parseFloat(pol["pop"][key]);
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
                        if (years.includes(key)) {
                            if (value > parseFloat(max)) {
                                max = value;
                            }
                        }
                    }
                }
            }
        });

        //console.log(min,max);
        var color = d3.scale.linear().range(['yellow', 'red']);
        color.domain([min,max]);

        colorpol[pollutant] = color;
    });

    var notYearKeys = ["dens", "pop", "sex", "age", "unit","icd10", "airsect", "geo", "airpol",
                       "prod_nrg","engine", "indic_nv", "nst07", "pe_type", "product","indic_nrg", "tax",
                        "COUNTRY", "NAME", 'POPULATION', 'NUTS_ID'];

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
                        var value = parseFloat(md[key]) / parseFloat(md["pop"][key])*1000.0;
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
                        var value = parseFloat(md[key]) / parseFloat(md["pop"][key])*1000.0;
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

        //console.log(min,max);
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
            case "mv":
                color.range(['pink', 'darkred']);
                break;
        }
        color.domain([min,max]);
        //console.log(color.domain(),color.range());

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

    d3.select('#maptitle').html(polNameMap[curPol]);

    data = dataMap[curPol];

    //console.log(colorpol[curPol].domain()[1]);
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
                    var value = (parseFloat(d.properties[year])/parseFloat(d.properties["pop"][year])*10000.0).toFixed(4);
                    var value2 = (parseFloat(d.properties[date])/parseFloat(d.properties['pop'][date])*10000.0).toFixed(4) + ' ' + unitPolMap[curPol] + '/10000 habs';
                    d3.select('.title'+year).html(value2);
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
                if (datebis === "2001")
                    datebis = "2000";
                if (datebis === "2004")
                    datebis = "2003";

                //console.log("pol : ", d.properties[date]);

                var value = (parseFloat(d.properties[date])/parseFloat(d.properties["pop"][date]));
                return colorpol[curPol](value);
            }
            else{
                //console.log(d);
                return "lightgrey";
            }
        });

        map.call(tip);

        map.exit().remove();

        i++;
    });
    d3.select("#pollegend").selectAll(".svglegend").remove();

    // build the map 1 legend
    // La légende
    var dataUpdate = [curPol+"1",curPol+"2",curPol+"3",curPol+"4",curPol+"5"];

    var legend = d3.select("#pollegend").append("svg").attr("class", "svglegend").selectAll(".legend")
        .data(dataUpdate);

    legend.enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {return "translate("+(30) +"," + ((20) +i * 20) + ")"; })
        .append("circle")
        .attr("r", 5)
        .attr("fill", function(d,i) {
            i=i+1;
            return colorpol[curPol]((colorpol[curPol].domain()[1]/5)*i);})
        .attr("x", 40);

    legend.append("text")
        .attr("x", 15)
        .attr("dy", ".35em")
        .text(function(d,i) {
            i=i+1;
            return parseInt((colorpol[curPol].domain()[1]*10000/5)*i)+ ' ' + unitPolMap[curPol] + '/10000 habs';
        });

    legend.exit().remove();

}

function updateDate(){

    d3.selectAll('.maptitle').remove();
    d3.selectAll('div.map').remove();

    d3.select("#maps").append("h4").attr("id", "maptitle").attr("class", "maptitle");
    d3.select("#maps2").append("h4").attr("id", "map2title").attr("class", "maptitle");

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

//TODO PRENDRE LES DONNEES DE POPULATION ANNEE PAR ANNEE
/* fonction de mise a jour des smallMultiples de mesure */
function updateMes(){
    var choice;
    d3.selectAll(".radiomesure").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
            console.log(choice);
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

    years = years.filter(function(year){return parseInt(year) > 1999;});
    years.sort();

    if (years.length > 12){
        var toSup = years.length - 12;
        years = years.slice(toSup,lgt);
    }
    
    updateDate(years);

    d3.select('#map2title').html(choice);

    data = mesureMap[curMes];

    SVGs2.each(function(date) {
        d3.select(this).selectAll('path').remove();

        var map = d3.select(this).selectAll('path')
            .data(data);

        map.style("fill", function (d) {
            if (!isNaN(d.properties[date])){
                var datebis = date;
                var value = parseFloat(d.properties[date])/parseFloat(d.properties["pop"][datebis]);
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


                    if (d.properties["pop"][datebis]){
                        var value = parseFloat(d.properties[date])/parseFloat(d.properties["pop"][datebis])*1000.0;
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
                        var value = (parseFloat(d.properties[year])/parseFloat(d.properties["pop"][year])*1000.0).toFixed(4);                        
                        var value2 = (parseFloat(d.properties[year])/parseFloat(d.properties['pop'][year])*1000.0).toFixed(4) + ' ' + unitMesMap[curMes] + '/1000 habs';
                        d3.select('.title2'+year).html(value2);
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


    // build the map 1 legend

    d3.select("#meslegend").selectAll(".svglegend").remove();
    // La légende
    var dataUpdate = [curMes+"1",curMes+"2",curMes+"3",curMes+"4",curMes+"5"];


    var legend = d3.select("#meslegend").append("svg").attr("class", "svglegend").selectAll(".legend")
        .data(dataUpdate);

    legend.enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate("+(30) +"," + ((20) +i * 20) + ")"; })
        .append("circle")
        .attr("r", 5)
        .attr("fill", function(d,i) {
            i=i+1;
            return colormes[curMes]((colormes[curMes].domain()[1]/5)*i);})
        .attr("x", 40);

    legend.append("text")
        .attr("x", 15)
        .attr("dy", ".35em")
        .text(function(d,i) {
            i=i+1;
            return ((colormes[curMes].domain()[1]/5)*i).toFixed(4)+' '+unitMesMap[curMes] + '/1000 habs';
        });

    legend.exit().remove();
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
              transport, heartdiseases, cancer, motorcars, animals, europe){

    if (error) throw error;

    //on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    density.forEach(function(dens){
        insertDataAttribute(dens,pollutions,'dens');
        insertDataAttribute(dens,pesticides,'dens');
        insertDataAttribute(dens,energie,'dens');
        insertDataAttribute(dens,nuclear,'dens');
        insertDataAttribute(dens,taxes,'dens');
        insertDataAttribute(dens,transport,'dens');
        insertDataAttribute(dens,heartdiseases,'dens');
        insertDataAttribute(dens,cancer,'dens');
        insertDataAttribute(dens,motorcars,'dens');
    });

    //on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    population.forEach(function(pop){
        insertDataAttribute(pop,pollutions,'pop');
        insertDataAttribute(pop,pesticides,'pop');
        insertDataAttribute(pop,energie,'pop');
        insertDataAttribute(pop,nuclear,'pop');
        insertDataAttribute(pop,taxes,'pop');
        insertDataAttribute(pop,transport,'pop');
        insertDataAttribute(pop,heartdiseases,'pop');
        insertDataAttribute(pop,cancer,'pop');
        insertDataAttribute(pop,motorcars,'pop');
    });


    //on créé le div des polluants
    createPolDiv(pollutions);

    //on créé dynamiquement le div des mesures
    createMesureDiv(mesures);

    //On récupère la liste pollution en fonction du polluant (radio bouton) choisi
    createPolDatas(pollutions);

    //on intègre les données de pollution aux données de map
    createMergedPolAndMapData(europe);

    //on créé des variables globales pour les données des mesures //TODO fix this
    createMesureData(europe, pesticides, energie, nuclear, taxes, transport, heartdiseases, cancer, motorcars);
    //console.log(dataMap);

    //on créé les scales de couleurs pour chaque polluants
    //updateScalesColor();

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=pol]")
        .on("change", function() {
            updatePol();
        });

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=mesure]")
        .on("change", function() {
            updateMes();
            updatePol();
        });

    //on affiche les smallMultiples de mesure
    updateMes();

    //on affiche les smallMultiples de pollution
    updatePol();


    // l'idée serait de récupérer la valeur du 1er bouton radio puis la valeur du 2eme bouton radio
    // définir le vecteur des années pour lesquelles on va afficher des smallMaps
    // définir les scales de couleurs en fonction du vecteur des années
    // afficher les smallMaps
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
    //la map de l'europe
    .defer(d3.json,"geodata/euro/eurotopo.json")
    .await(init);
