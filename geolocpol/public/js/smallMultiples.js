var width = 1550, height = 800;

var curYear = '2014';

var mapWidth = 250;
var mapHeight = 200;

var projection = d3.geo.stereographic().center([3.9,43.0]).scale(300).translate([mapWidth / 2, mapHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

var dateFormat = d3.time.format("%Y");

var years = ["2000","2001","2002","2003","2004","2005","2006","2007",
             "2008","2009","2010","2011","2012","2013","2014"];


function createPolData(pollutions){
    var choice;
    d3.selectAll(".radiopol").each(function(d){
        rb = d3.select(this);
        if(rb.property("checked")){
            choice= rb.property("value");
        }
    });
    var pollution = pollutions.filter(function(d,i){return (d.geo !== "EU28" && d.airpol === choice && d.airsect === "TOT_NAT")});
    return pollution;
}

var pollutants = [];

var color = d3.scale.linear().range(['yellow', 'red']);
var color2 = d3.scale.linear().range(['lightgreen', 'darkgreen']);

function init(error,pollutions,density, pesticides, energie, nuclear, taxes,
              infantmort,transport, heartdiseases, cancer, motorcars, europe){

    if (error) throw error;

    pollutions.forEach(function(p){
        if (!pollutants.includes(p.airpol)) {
            pollutants.push(p.airpol);
        }
    });

    /********************* le div des polluants **********************/
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
        .html(function(d, i) {  return d.last == true ? d :  d + '<br>'});


    /****** On récupère la liste pollution en fonction du polluant (radio bouton) choisi *******/
    var pollution = createPolData(pollutions);


    //draw a map for each date
    var dateJoin = d3.select('#maps').selectAll('div.map')
        .data(years);

    var divs = dateJoin.enter()
        .append('div').attr({
            'id':function(d){ return 'map_'+d; },
            'class':'map'
        });


    divs.append('p').text(function(d){ return dateFormat(new Date(d)); });

    var SVGs = divs.append('svg').attr({
        'width':mapWidth,
        'height':mapHeight
    });

    //on intègre les données de pollution aux données de map
    var data = topojson.feature(europe, europe.objects.regions).features;

    //création d'un tableau des codes nuts 1
    var geos = [];

    pollution.forEach(function(p){
        if (!geos.includes(p["geo"]))
            geos.push(p["geo"]);
    });

    data = data.filter(function(d,i){return geos.includes(d.properties["NUTS_ID"])});


    years.forEach(function(year){
        data.forEach(function(d){
            pollution.forEach(function(p){
                if (d.properties["NUTS_ID"] === p["geo"]){
                    d.properties[year] = parseFloat(p[year]);
                }
            });
        });
    });


    SVGs.each(function(date){

        d3.select(this).selectAll('path')
            .data(data)
            .enter().append("path")
            .attr({
                "d":path,
                "id":function(d){
                    return d.properties["NUTS_ID"] + date;
                }
            });
    });

    var test=0;
    function update(){
        SVGs.each(function(date){

            var dataRange = [];
            pollution.forEach(function (p) {
                if (p["geo"] !== 'EU28'){
                    dataRange.push(p[date]);
                }
            });

            var min = d3.min(dataRange, function(d) { if (parseFloat(d) !== 0.0) return parseFloat(d);});
            var max = d3.max(dataRange, function(d) { if (parseFloat(d) !== 0.0) return parseFloat(d);});
            color.domain([min,max]);

            d3.select(this).selectAll('path')
                .data(data)
                .style("fill", function (d) {
                    if (test === 0){
                        console.log(d.properties[date]);
                        test++;
                    }

                    if (!isNaN(d.properties[date])){
                        //console.log(color(d.properties[date]));
                        return color(d.properties[date]);
                    }
                    /*else{
                        console.log(d);
                        return "lightgrey";
                    }*/
                });
        })
    }

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