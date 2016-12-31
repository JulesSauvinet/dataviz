//TODO PRENDRE EN COMPTE LA POPULATION DANS LES SCALES, ET NON LA DENSITE??!!!!!!!!! enfin de MESURE AU MOINS
//E.G regarder cancer et heartdisease
//TODO LEGENDE
//TODO TITRES
//TODO DESIGN
//TODO CHARTS QUAND HOOVER


//NOT USED mais eventuellement la taille de la vizu
var width = 1550, height = 800;

//le polluant courant sélectionné
var curPol = "NH3";
var curMes = "c";
var unitPolMap = {};
//la taille d'une small map
var mapWidth = 230;
var mapHeight = 180;

//projection + path de l'europe d'une small map
var projection = d3.geo.stereographic().center([3.9,43.0]).scale(375).translate([mapWidth / 2-20, mapHeight / 2+40]);

var path = d3.geo.path()
    .projection(projection);

var dateFormat = d3.time.format("%Y");

//les années choisies (une map par année)
//TODO more dynamic?
var years = [/*"2000","2001","2002",*/"2003","2004","2005","2006","2007",
             "2008","2009","2010","2011","2012","2013","2014"];

var polNameMap = {'NH3' : 'Ammoniac', 'NMVOC' : 'Composés volatiles organiques', 'NOX' : 'Oxyde d\'azote',
                  'PM10' : 'Particules 10', 'PM2_5': 'Particules 2.5', 'SOX' : 'Oxyde de soufre'};

//on dessine une map pour chaque année pour la pollution
var dateJoin = d3.select('#maps').selectAll('div.map').data(years);

var divs = dateJoin.enter()
    .append('div').attr({
        'id':function(d){ return 'map_'+d; },
        'class':'map'
    });


divs.append('p').attr({'class' : 'pmap'}).text(function(d){ return dateFormat(new Date(d)); });

//le titre -> nom de l'année
var SVGs = divs.append('svg').attr({
    'width':mapWidth,
    'height':mapHeight,
    'class' : 'svgmap'
});

//on dessine une map pour chaque année pour les mesures
var dateJoin2 = d3.select('#maps2').selectAll('div.map').data(years);

var divs2 = dateJoin2.enter()
    .append('div').attr({
        'id':function(d){ return 'map2_'+d; },
        'class':'map'
    });

divs2.append('p').attr({'class' : 'pmap'}).text(function(d){ return dateFormat(new Date(d)); });

//le titre -> nom de l'année
var SVGs2 = divs2.append('svg').attr({
    'width':mapWidth,
    'height':mapHeight,
    'class' : 'svgmap'
});

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d,date) {
        var toDisplay =  'Code Pays :  ' +  d.properties["NUTS_ID"] +'</br>'
            +'Pollution en ' + polNameMap[curPol] +' : ' + parseFloat(d.properties[date]) + unitPolMap[curPol];
        return toDisplay;
    });

//TODO UN SEUL DATA?
var pollutants = [];
/* fonction pour créer le div des polluants de manière dynamique */
function createPolDiv(pollutions){
    pollutions.forEach(function(p){
        if (!pollutants.includes(p.airpol)) {
            pollutants.push(p.airpol);
        }
    });

    var fieldset = d3.select("#pollutiondiv").append("form");
    fieldset.append("legend").html("<h4>Choix polluant</h4>");
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
        .html(function(d, i) {  return d.last == true ? polNameMap[d] :  polNameMap[d] + '<br>'});
}

var mesures = ['Morts de cancers','Pesticides', 'Energie', 'Chauffage Nucleaire', 'Taxes environnementales','Transport', 'Morts de maladies cardiaques',  'Moteurs de voitures'];
var mesuresCodes = {'Pesticides' : 'pe', 'Energie':'en', 'Chauffage Nucleaire' :'cn', 'Taxes environnementales' : 'te',
    'Transport' : 'tr', 'Morts de maladies cardiaques':'hd', 'Morts de cancers' : 'c', 'Moteurs de voitures' : 'mv'};
/* fonction pour créer le div des mesures de manière dynamique */
function createMesureDiv() {
    var fieldset = d3.select("#mesurediv").append("form");
    fieldset.append("legend").html("<h4>Choix mesure</h4>");
    var radioSpan = fieldset.selectAll(".radio").data(mesures);

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
        .html(function(d, i) {  return d.last == true ? d :  d + '<br>'});
}

var polMap = {};
/* fonction qui créé les datasets des polluants pour chaque polluant*/
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
}

var dataMap = {};
var geoPol = {};
/* fonction pour un dataset contenant les données de map + du polluant courant sélectionné*/
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

function mergeData(data1,data2){
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
            }
        });
    });

    return data1;
}

var geoMes = {};
//TODO centraliser les données pour optimiser le stockage?
var mesureMap = {};
function createMesureData(europe, pesticides, energie, nuclear, taxes,
                          transport, heartdiseases, cancer, motorcars){

    var dataRaw = topojson.feature(europe, europe.objects.regions).features;

    //pesticides
    var data1 = JSON.parse(JSON.stringify(dataRaw));
    pesticides.filter(function(d,i){return d["geo"] !== "EU15" && d["pe_type"] === "PE_0"});
    data1= mergeData(data1,pesticides);
    mesureMap['pe'] = data1;

    //energie
    var data2 = JSON.parse(JSON.stringify(dataRaw));
    energie.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nv"] === "FEC_TOT"});
    data2= mergeData(data2,energie);
    mesureMap['en'] = data2;

    //chauffage nucleaire
    var data3 = JSON.parse(JSON.stringify(dataRaw));
    nuclear.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["indic_nrg"] === "B_100100"});
    data3 = mergeData(data3,nuclear);
    mesureMap['cn'] = data3;

    //taxes
    var data4 = JSON.parse(JSON.stringify(dataRaw));
    taxes.filter(function(d,i){return d["geo"] !== "EU28" && d["geo"] !== "EA19" && d["tax"] === "ENV"});
    data4 = mergeData(data4,taxes);
    mesureMap['te'] = data4;

    //transport
    var data6 = JSON.parse(JSON.stringify(dataRaw));
    transport.filter(function(d,i){return d["geo"] != "EU15"});
    data6 = mergeData(data6,transport);
    mesureMap['tr'] = data6;

    //heart diseases
    var data7 = JSON.parse(JSON.stringify(dataRaw));
    data7 = mergeData(data7,heartdiseases);
    mesureMap['hd'] = data7;

    //cancer
    var data8 = JSON.parse(JSON.stringify(dataRaw));
    data8 = mergeData(data8,cancer);
    mesureMap['c'] = data8;

    //motor cars
    var data9 = JSON.parse(JSON.stringify(dataRaw));
    motorcars.filter(function(d,i){return d["prod_nrg"] === "TOTAL" && d["engine"] === "TOTAL"});
    data9 = mergeData(data9,motorcars);
    mesureMap['mv'] = data9;

    for (var mesure in mesureMap){
        geoMes[mesure]=[];
        mesureMap[mesure].forEach(function(d){
            geoMes[mesure].push(d.properties["NUTS_ID"]);
        });
    }
}

var colorpol = {};
var colormes = {};
/* fonction qui créé les scales de couleurs pour chaque polluant
   puis pour chaque mesures en fonction des min et max (appelé une seule fois) */
function createScalesColor(){
    pollutants.forEach(function(pollutant){

        var pollution=polMap[pollutant];

        var min = Number.MAX_VALUE;
        pollution.forEach(function(pol){
            if (geoPol[pollutant].includes(pol['geo'])){
                for (var key in pol){
                    if (key !== "unit" && key !== "airsect" && key !== "geo" && key !== "airpol" && key !== "dens") {
                        //on ne base la scale que s'il y a une densité associé au code NUTS
                        var value = parseFloat(pol[key]) / parseFloat(pol["dens"][key]);
                        var year = parseInt(key);
                        if (year >= 2003 && year <= 2014) {
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
                    if (key !== "unit" && key !== "airsect" && key !== "geo" && key !== "airpol" && key !== "dens") {
                        //on ne base la scale que s'il y a une densité associé au code NUTS
                        var year = parseInt(key);
                        var value = parseFloat(pol[key]) / parseFloat(pol["dens"][year]);
                        if (year >= 2003 && year <= 2014) {
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

    var notYearKeys = ["dens", "sex", "age", "unit","icd10", "airsect", "geo", "airpol",
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
                        var value = parseFloat(md[key]) / parseFloat(md["dens"][key]);
                        var year = parseInt(key);
                        if (year >= 2003 && year <= 2014) {
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
                        var value = parseFloat(md[key]) / parseFloat(md["dens"][key]);
                        var year = parseInt(key);
                        if (year >= 2003 && year <= 2014) {
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
                color.range(['orange', 'brown']);
                break;
        }
        color.domain([min,max]);
        //console.log(color.domain(),color.range());

        colormes[mes] = color;
    });
}

/* fonction de mise a jour des smallMultiples de pollution */
function updatePol(){

    var choice;
    d3.selectAll(".radiopol").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
        }
    });

    curPol = choice;

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
                tip.show(d,date);
            })
            .on('mouseout', tip.hide);

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

                var value = (parseFloat(d.properties[date])/parseFloat(d.properties["dens"][datebis]));

                //console.log(value);

                return colorpol[curPol](value);
            }
            else{
                console.log(d);
                return "lightgrey";
            }
        });

        map.call(tip);

        map.exit().remove();

        i++;
    });

    // build the map legend
    // La légende
    var nbItemLegend = [1,2,3,4,5];

    /*var legend = d3.select("#pollegend").append("svg").selectAll(".legend")
        .data(nbItemLegend)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate("+(30) +"," + ((height - 200) +i * 15) + ")"; });

    // draw legend colored circles
    legend.append("circle")
        .attr("r", 5)
        .attr("fill", function(d,i) { return colorpol[curPol]((colorpol[curPol].domain()[1]/5)*d);})
        .attr("x", 40);

    // draw legend text
    legend.append("text")
        .attr("x", 15)
        .attr("dy", ".35em")
        .text(function(d) {
            (colorpol[curPol].domain()[1]/5)*d;
        });*/

}

//TODO PRENDRE LES DONNEES DE POPULATION ANNEE PAR ANNEE
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

    data = mesureMap[curMes];
    //console.log(data);

    SVGs2.each(function(date) {
        
        d3.select(this).selectAll('path').remove();

        var map = d3.select(this).selectAll('path')
            .data(data);

        map.exit().remove();

        map.style("fill", function (d) {
            if (!isNaN(d.properties[date])){
                var datebis = date;
                var value = parseFloat(d.properties[date])/parseFloat(d.properties["dens"][datebis]);
                return colormes[curMes](value);
            }
            else{
                return "lightgrey";
            }
        });

        map.enter().append("path")
            .attr({
                "d": path,
                "id": function (d) {
                    //console.log(d.properties["NUTS_ID"]);
                    return d.properties["NUTS_ID"] + '2' + date;
                }
            }).style("fill", function (d) {
            if (!isNaN(d.properties[date])){

                var datebis = date;

                var value = parseFloat(d.properties[date])/parseFloat(d.properties["dens"][datebis]);

                return colormes[curMes](value);
            }
            else{
                return "lightgrey";
            }
        });



        map.exit().remove();

    });


}

function insertDensity(dens, data){
    data.forEach(function(d){
        if (!d['dens'])
            d['dens']={};
        if (d["geo"] === dens["geo"]){
            years.forEach(function(year){
                if (d[year])
                    d['dens'][year]= dens[year];
            });
        }
    });
}

function init(error,pollutions,density, pesticides, energie, nuclear, taxes,
              transport, heartdiseases, cancer, motorcars, europe){

    if (error) throw error;

    //on intègre la données de densité aux autres données pour calibrer les scales de couleurs notamment
    density.forEach(function(dens){
       insertDensity(dens,pollutions);
       insertDensity(dens,pesticides);
       insertDensity(dens,energie);
       insertDensity(dens,nuclear);
       insertDensity(dens,taxes);
       insertDensity(dens,transport);
       insertDensity(dens,heartdiseases);
       insertDensity(dens,cancer);
       insertDensity(dens,motorcars);
    });

    //on créé le div des polluants
    createPolDiv(pollutions);

    //on créé dynamiquement le div des mesures
    createMesureDiv();

    //On récupère la liste pollution en fonction du polluant (radio bouton) choisi
    createPolDatas(pollutions);

    //on intègre les données de pollution aux données de map
    createMergedPolAndMapData(europe);

    //on créé des variables globales pour les données des mesures //TODO fix this
    createMesureData(europe, pesticides, energie, nuclear, taxes,transport, heartdiseases, cancer, motorcars);
    //console.log(dataMap);

    //on créé les scales de couleurs pour chaque polluants
    createScalesColor();


    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=pol]")
        .on("change", function() {
            updatePol();
        });

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=mesure]")
        .on("change", function() {
            updateMes();
        });

    //on affiche les smallMultiples de pollution
    updatePol();

    //on affiche les smallMultiples de mesure
    updateMes();
}



// permet de charger les fichiers de manière asynchrone
queue()
    //les emissions de pollutions dans l'air (le référentiel quoi)
    .defer(d3.tsv, "data/eurostats/clean/env_air_emission.tsv")
    //les données sur la densité pour la normalisation des scales
    .defer(d3.tsv, "data/eurostats/clean/demo_r_d3dens.tsv")
    //les pesticides de 80 à 2008
    .defer(d3.tsv, "data/eurostats/clean/pesticides_sales2.tsv")
    //production d'energie par secteur
    .defer(d3.tsv, "data/eurostats/clean/env_rpep.tsv")
    //les donnees du chauffage nucleaire
    .defer(d3.csv, "data/eurostats/clean/nuclear_heat.csv")
    //les donnees des taxes sur l'environnement
    .defer(d3.csv, "data/eurostats/clean/env_ac_taxes.csv")
    //les donnees du transport
    .defer(d3.tsv, "data/eurostats/clean/road_go_na_rl3g_transport.tsv")
    //les donnees du chauffage nucleaire
    .defer(d3.tsv, "data/eurostats/clean/tgs00059_ischaemic_heart_diseases.tsv")
    //les donnees des morts de cancer
    .defer(d3.tsv, "data/eurostats/clean/tgs00058_cancer.tsv")
    //les donnees de moteurs de voiture
    .defer(d3.csv, "data/eurostats/clean/type_of_motor_cars.csv")
    //la map de l'europe
    .defer(d3.json,"geodata/euro/eurotopo.json")
    .await(init);