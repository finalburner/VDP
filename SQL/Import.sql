-- SCRIPT d'importation XLSX To SQL
--1-CLEAN TEMPORARY TABLE
DROP TABLE #CVC;
--2-IMPORT DATA TO TMP TABLE

--SELECT * 
SELECT * INTO #CVC
FROM OPENROWSET('Microsoft.ACE.OLEDB.12.0',
  'Excel 12.0 Xml; HDR=NO; IMEX=1;
   Database=C:\Base_GTB_CT05001_1_V3.xlsx',
   [CVC$])
 ;
 --3-Review data classification and send them to SUPERVISION TABLE
 SELECT 
   CAST ( F3 AS CHAR(3)) AS Metier
 INTO dbo.SUPERVISION
 FROM #CVC;