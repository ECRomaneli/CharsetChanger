#!/bin/sh

# LIBRARY PATH
LIB_PATH='./lib/'

# ORIG
TMP_PATH="${LIB_PATH}tmp/"

# Create module
echo 'Building module...'
tsc
echo 'Minifying...'
rm -f dist/module/*.min.js
for JS in dist/module/*.js; do
    MIN_JS=$(echo $JS | sed s/.js/.min.js/g)
    uglifyjs --compress --mangle --output $MIN_JS -- $JS
    rm -f $JS
done


echo 'Build finish!'