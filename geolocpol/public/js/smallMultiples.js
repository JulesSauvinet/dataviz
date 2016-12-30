//TODO PRENDRE EN COMPTE LA POPULATION OU LA SUPERFICIE DANS LES SCALES!

//NOT USED mais eventuellement la taille de la vizu
var width = 1550, height = 800;

//le polluant courant sélectionné
var curPol = "NH3";
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

/*********************** NOT USED ********************************/
var colorMap = {};
var colors = [];
//la scale de pollution
var color0 = d3.scale.linear().range(['yellow', 'red']);
//la scale de densité de pop
var color1 = d3.scale.linear().range(['lightblue', 'darkblue']);
//la scale de densité de pesticide
var color2 = d3.scale.linear().range(['whitesmoke', 'orange']);
//la scale d'energie
var color3 = d3.scale.linear().range(['lightyellow', 'gold']);
//la scale de nucleaire
var color4 = d3.scale.linear().range(['yellow', 'brown']);
//la scale des taxes
var color5 = d3.scale.linear().range(['pink', 'magenta']);
//la scale de mortalité infantile
var color6 = d3.scale.linear().range(['pink', 'purple']);
//la scale de transport
var color7 = d3.scale.linear().range(['lightgreen', 'darkgreen']);
//la scale de heartdisease
var color8 = d3.scale.linear().range(['pink', 'purple']);
//la scale de cancer
var color9 = d3.scale.linear().range(['pink', 'purple']);
//la scale de moteus
var color10 = d3.scale.linear().range(['orange', 'brown']);
colors.push(color0,color1,color2,color3,color4,color5,color6,color7,color8,color9,color10);
/****************************************************************/

//on dessine une map pour chaque année
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


var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d,date) {
        var toDisplay =  'Code Pays :  ' +  d.properties["NUTS_ID"] +'</br>'
            +'Pollution en ' + polNameMap[curPol] +' : ' + parseFloat(d.properties[date]) + unitPolMap[curPol];
        return toDisplay;
    });

//TODO UN SEUL DATA
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
                        d.properties[year] = p[year];
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

var colorpol = {};


/* fonction qui créé les scales de couleurs pour chaque polluant en fonction des min et max (appelé une seule fois) */
function createScalesColorPol(){
    pollutants.forEach(function(pollutant){

        var pollution=polMap[pollutant];

        //console.log(pollution);

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
}

function update(){

}

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

        i++;
    });

}

function init(error,pollutions,density, pesticides, energie, nuclear, taxes,
              infantmort,transport, heartdiseases, cancer, motorcars, europe){

    if (error) throw error;

    //on intègre la données de densité au données de pollution pour calibrer les scales de couleurs notamment
    density.forEach(function(dens){
       pollutions.forEach(function(pol){
           if (!pol['dens'])
               pol['dens']={};
           if (pol["geo"] === dens["geo"]){
               years.forEach(function(year){
                   pol['dens'][year]= dens[year];
               });
           }
       });
    });

    //on créé le div des polluants
    createPolDiv(pollutions);

    //On récupère la liste pollution en fonction du polluant (radio bouton) choisi
    createPolDatas(pollutions);

    //on intègre les données de pollution aux données de map
    createMergedPolAndMapData(europe);

    //on créé les scales de couleurs pour chaque polluants
    createScalesColorPol();

    //console.log(dataMap);

    //code de mise a jour des smallMultiples de pollution
    d3.selectAll("input[type=radio][name=pol]")
        .on("change", function() {
            updatePol();
        });

    //on affiche les smallMultiples de pollution
    updatePol();

    //on update la vizu TODO ce sera pour les autres smallMultiples
    update();
}



// permet de charger les fichiers de manière asynchrone
queue()
//les emissions de pollutions dans l'air
    .defer(d3.tsv, "data/eurostats/clean/env_air_emission.tsv")
    //les données sur la densité
    .defer(d3.tsv, "data/eurostats/clean/demo_r_d3dens.tsv")
    //les pesticides de 80 à 2008
    .defer(d3.tsv, "data/eurostats/clean/pesticides_sales2.tsv")
    //production d'energie par secteur
    .defer(d3.tsv, "data/eurostats/clean/env_rpep.tsv")
    //les donnees du chauffage nucleaire
    .defer(d3.csv, "data/eurostats/clean/nuclear_heat.csv")
    //les donnees des taxes sur l'environnement
    .defer(d3.csv, "data/eurostats/clean/env_ac_taxes.csv")
    //les donnees de la mortalite infantile
    .defer(d3.tsv, "data/eurostats/clean/hlth_cd_yinfr_infant_mortality.tsv")
    //les donnees du transport
    .defer(d3.tsv, "data/eurostats/clean/road_go_na_rl3g_transport.tsv")
    //les donnees du chauffage nucleaire
    .defer(d3.tsv, "data/eurostats/clean/tgs00059_ischaemic_heart_diseases.tsv")
    //les donnees des morts de cancer
    .defer(d3.csv, "data/eurostats/clean/tgs00058_cancer.tsv")
    //les donnees de moteurs de voiture
    .defer(d3.csv, "data/eurostats/clean/type_of_motor_cars.csv")
    //la map de l'europe
    .defer(d3.json,"geodata/euro/eurotopo.json")
    .await(init);