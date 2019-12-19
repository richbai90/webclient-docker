for %%a in (*.js) do @java -jar "../../yuicompressor-2.4.6.jar" "%%a" -o "min/%%a" --nomunge --preserve-semi --disable-optimizations --charset utf-8 

pause