fileres="version-info.res"
file="version-info.rc"
if [ -f "$file" ]
then
  pkg -t latest-win-x64 client.js -d -c package-client.json -o SRV_MOBILITE.exe
  C:/ResourceHacker/ResourceHacker.exe -open version-info.rc -action compile -save version-info.res
  C:/ResourceHacker/ResourceHacker.exe -open SRV_MOBILITE.exe -resource version-info.res -action add -save SRV_MOBILITE.exe
  rm $file
  rm $fileres

else
	echo "$file not found."
fi
