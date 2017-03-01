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
     MnemoMetier AS Metier,
	 MnemoInstallationTechnique  AS Installation_technique,
	 MnemoNomGroupe AS NomGroupeFonctionnel,
	 MnemoDesignationGroupe AS DesignGroupeFonctionnel,
	 MnemoNomObjet AS NomObjetFonctionnel,
	 MnemoDesignationObjet AS DesignObjetFonctionnel,
	 MnemoInformation AS Information,
	 LibelleEquipement AS Libelle_groupe,
	 LibelleInformation AS Libelle_information,
	 Localisation AS Localisation,
	 TypeInfo AS Type,
	 "Etat 0" AS TOR_CodeEtat0,
     "Etat 1" AS TOR_CodeEtat1,
	 CriticiteAlarme AS TOR_CriticiteAlarme,
	 CategorieAlarme AS TOR_CategorieAlarme,
	 Unité AS ANA_Unite,
	 Min AS ANA_ValeurMini,
	 Max AS ANA_ValeurMaxi,
	 AdrProtocole AS ACQ_Protocole,
	 AdrEquipement AS ACQ_Equipement,
	 AdrVariable AS ACQ_Adresse,
	 TypeVariable AS PLC_Type,
	 AdrPhysique AS PLC_Adresse,
	 GpeFonctionnel AS PLC_Groupe,
	 ObjetFonctionnel AS PLC_Objet

   FROM [Liste$]')
  
	
	DROP TABLE VDP.dbo.SUPERVISION
 SELECT *  INTO VDP.dbo.SUPERVISION
 FROM #CVC
;