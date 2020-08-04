#!/bin/sh

echo "You need to install npm, node, electron and all the dependencies!"
echo "Do you permit me to install everyting? (y/n)"
read input_variable

if input_variable -eq "y"
then
npm i -D electron

npm i axios jwt-decode

npm i keytar
else
echo "if you want to use this app you will need to install the dependencies"
fi
