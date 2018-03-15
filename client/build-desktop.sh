fileres="version-info.res"
file="version-info.rc"
if [ -f "$file" ]
then
  pkg -t latest-win-x64 opc.js -d -c package-client.json -o SRV_MOBILITE_OPC.exe
  C:/ResourceHacker/ResourceHacker.exe -open version-info.rc -action compile -save version-info.res
  C:/ResourceHacker/ResourceHacker.exe -open SRV_MOBILITE_OPC.exe -resource version-info.res -action add -save SRV_MOBILITE_OPC.exe
  rm $file
  rm $fileres

else
	echo "$file not found."
fi
