#!/bin/sh

# Create module
echo 'Building module...'
tsc

if  [ "$1" == 'minify' ]; then
    echo 'Minifying...'
    for JS in './dist/module/*.js'; do
        uglifyjs --compress --mangle --output $JS -- $JS
    done
fi

echo 'Build finish!'