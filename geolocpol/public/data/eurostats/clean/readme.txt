EXPLICATIONS

+pesticides_sales1980_2008 :
 +	faire attention on n'a que de 1980 � 2008
 +	on n'a 5 types de pesticides, donc 5 pesticides diff�rents
 +	-> on pourrait sommer les 5 valeurs pour avoir une valeur unique par pays
 +
 +env_air_emission : 
 +	TOT_NAT serait la valeur � r�cup�rer, les autres sont une grande d�composition des diff�rents formats
 +	NH3 = Ammoniac
 +	NMVOC = Non-methane volatile organic compounds
 +	NOX = Oxyde d'azote
 +	PM10 = particules en suspension dont le diam�tre est inf�rieur � 10 microm�tres (poussi�res inhalables)
 +	PM2_5 = particules en suspension dont le diam�tre est inf�rieur � 2.5 microm�tres
 +		elles p�n�trent plus profond�ment dans l'appareil respiratoire
 +	SOX = Oxyde de soufre
 +
 +env_ac_taxes :
 +	on a ici le total des taxes environnementales mais aussi d�compos� en 4 sous-taxes
 +	ENV = total environnemental
 +	NRG = �nergie
 +	POL = pollution
 +	RES = ressource
 +	TRA = transport
 +	-> a voir si on peut corr�ler des donn�es de pollution avec chaque sous-taxes
 +
 +------------------------------------------------- PAS UTILES -------------------------------------------------
 +
 +env_air_greengasemission :
 +	MIO_T = million de tonnes
 +	THS_T = milliers de tonnes
 +	-> comme on a une �chelle, qu'importe vu que on fait un ratio, mais on doit n'en prendre qu'un seul
 +	apr�s je pense qu'il faut aussi choisir le bon indicateur � afficher car il est fort d�compos�
 +	-> si j'ai bien compris il faut garder CRF1, CRF2, CRF3, CRF4, CRF5, CRF6
 +	
 +aei_pr_ghg :
 +	on n'apprend rien ici qu'on n'a pas d�ja dans env_air_greengasemission 


CORRELATION
Ammoniac :
<-> pesticides_sales1980_2008


Oxyde d'azote :
Les principaux secteurs �metteurs sont : 
	les transports routiers
	l�industrie manufactur�re
	l�agriculture
	la transformation d��nergie
<-> nuclear_heat
<-> type_of_motor_cars
<-> env_ac_taxes avec TRA & NRG


Oxyde de soufre :
Les principaux secteurs �metteurs sont :
	la combustion des combustibles fossiles
	l'industrie chimique
<->  


PM10 :
proviennent de la combustion de combustibles fossiles, de l�essence et du gazole 
(transport, installations de chauffage, industries, usines d�incin�ration des ordures m�nag�res, centrales thermiques�), 
ainsi que du rev�tement des routes et des chantiers de construction
<-> env_ac_taxes avec ENV cad le total


PM2_5 :
la part du transport routier a fortement augment� avec l�extension du parc des v�hicules diesel, �metteurs notamment de particules � fines �
<-> type_of_motor_cars (ne prendre que les diesels)
<-> env_ac_taxes avec TRA


Names:
Consumption estimate of manufactured fertilizers(Nitrogen)
Consumption estimate of manufactured fertilizers(Phosphorus)
Consumption estimate of manufactured fertilizers(Potassium)