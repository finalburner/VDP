USE VDP
-- SCRIPT d'importation XLSX To SQL
--1-CLEAN TEMPORARY TABLE
DROP TABLE #CVC;
DROP TABLE VDP.dbo.SUPERVISION
CREATE TABLE VDP.dbo.SUPERVISION
(
     Metier CHAR(5) NOT NULL,
	 Installation_technique CHAR(8) NOT NULL,
	 NomGroupeFonctionnel CHAR(10) ,
	 DesignGroupeFonctionnel CHAR(10) ,
	 NomObjetFonctionnel CHAR(10) ,
	 DesignObjetFonctionnel CHAR(10) ,
	 Information CHAR(3) ,
	 Libelle_groupe CHAR(25) ,
	 Libelle_information CHAR(30) ,
	 Localisation CHAR(8) ,
	 Type CHAR(2) ,
	 TOR_CodeEtat0 char(6),
     TOR_CodeEtat1 char(6),
	 TOR_CriticiteAlarme TINYINT,
	 TOR_CategorieAlarme char(5),
	 ANA_Unite char(5),
	 ANA_ValeurMini char(5),
	 ANA_ValeurMaxi char(5),
	 ACQ_Protocole char(8),
	 ACQ_Equipement char(10),
	 ACQ_Adresse char(5),
	 PLC_Type char(5),
	 PLC_Adresse char(10) ,
	 PLC_Groupe char(20),
	 PLC_Objet char(20),
	 FK_CENTRE_THERMIQUE char(5) ) ;

--2-IMPORT DATA TO TMP TABLE FROM EXCELLINK1 Srv

SELECT * INTO #CVC
 FROM OPENQUERY(BASELINK, 
  'SELECT
     F3 AS Metier,
	 F4 AS Installation_technique,
	 F5 AS NomGroupeFonctionnel,
	 F6 AS DesignGroupeFonctionnel,
	 F7 AS NomObjetFonctionnel,
	 F8 AS DesignObjetFonctionnel,
	 F9 AS Information,
	 F10 AS Libelle_groupe,
	 F11 AS Libelle_information,
	 F12 AS Localisation,
	 F13 AS Type,
	 F14 AS TOR_CodeEtat0,
     F15 AS TOR_CodeEtat1,
	 F17 AS TOR_CriticiteAlarme,
	 F18 AS TOR_CategorieAlarme,
	 F23 AS ANA_Unite,
	 F24 AS ANA_ValeurMini,
	 F25 AS ANA_ValeurMaxi,
	 F34 AS ACQ_Protocole,
	 F35 AS ACQ_Equipement,
	 F36 AS ACQ_Adresse,
	 F37 AS PLC_Type,
	 F38 AS PLC_Adresse,
	 F39 AS PLC_Groupe,
	 F40 AS PLC_Objet

   FROM [Liste$]')
  
	DELETE TOP (4) FROM #CVC  ;
	DROP TABLE VDP.dbo.SUPERVISION
 SELECT *  INTO VDP.dbo.SUPERVISION
 FROM #CVC
;