EXPLICATIONS

+pesticides_sales1980_2008 :
 +	faire attention on n'a que de 1980 à 2008
 +	on n'a 5 types de pesticides, donc 5 pesticides différents
 +	-> on pourrait sommer les 5 valeurs pour avoir une valeur unique par pays
 +
 +env_air_emission : 
 +	TOT_NAT serait la valeur à récupérer, les autres sont une grande décomposition des différents formats
 +	NH3 = Ammoniac
 +	NMVOC = Non-methane volatile organic compounds
 +	NOX = Oxyde d'azote
 +	PM10 = particules en suspension dont le diamètre est inférieur à 10 micromètres (poussières inhalables)
 +	PM2_5 = particules en suspension dont le diamètre est inférieur à 2.5 micromètres
 +		elles pénètrent plus profondément dans l'appareil respiratoire
 +	SOX = Oxyde de soufre
 +
 +env_ac_taxes :
 +	on a ici le total des taxes environnementales mais aussi décomposé en 4 sous-taxes
 +	ENV = total environnemental
 +	NRG = énergie
 +	POL = pollution
 +	RES = ressource
 +	TRA = transport
 +	-> a voir si on peut corréler des données de pollution avec chaque sous-taxes
 +
 +------------------------------------------------- PAS UTILES -------------------------------------------------
 +
 +env_air_greengasemission :
 +	MIO_T = million de tonnes
 +	THS_T = milliers de tonnes
 +	-> comme on a une échelle, qu'importe vu que on fait un ratio, mais on doit n'en prendre qu'un seul
 +	après je pense qu'il faut aussi choisir le bon indicateur à afficher car il est fort décomposé
 +	-> si j'ai bien compris il faut garder CRF1, CRF2, CRF3, CRF4, CRF5, CRF6
 +	
 +aei_pr_ghg :
 +	on n'apprend rien ici qu'on n'a pas déja dans env_air_greengasemission 


CORRELATION
Ammoniac :
<-> pesticides_sales1980_2008


Oxyde d'azote :
Les principaux secteurs émetteurs sont : 
	les transports routiers
	l’industrie manufacturère
	l’agriculture
	la transformation d’énergie
<-> nuclear_heat
<-> type_of_motor_cars
<-> env_ac_taxes avec TRA & NRG


Oxyde de soufre :
Les principaux secteurs émetteurs sont :
	la combustion des combustibles fossiles
	l'industrie chimique
<->  


PM10 :
proviennent de la combustion de combustibles fossiles, de l’essence et du gazole 
(transport, installations de chauffage, industries, usines d’incinération des ordures ménagères, centrales thermiques…), 
ainsi que du revêtement des routes et des chantiers de construction
<-> env_ac_taxes avec ENV cad le total


PM2_5 :
la part du transport routier a fortement augmenté avec l’extension du parc des véhicules diesel, émetteurs notamment de particules « fines »
<-> type_of_motor_cars (ne prendre que les diesels)
<-> env_ac_taxes avec TRA


Names:
Consumption estimate of manufactured fertilizers(Nitrogen)
Consumption estimate of manufactured fertilizers(Phosphorus)
Consumption estimate of manufactured fertilizers(Potassium)