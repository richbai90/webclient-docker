#!/usr/bin/env zsh
autoload zmv
zmv -Q '(**/)(*)(.)' '$1${(L)2}'
yes | zmv -o-i -Q './(**/)(*)(/)' './$1${2:l}'
find ./ -name *.php -print0 | xargs -0 perl -i.bak -wpe "s/(include.+)[\"']([\w\x2F\x2C]+\.php)[\"'](.*)/\1\x27\L\2\x27\3/"
find . -name '*.php' -exec ggrep -PZzl '(?ms)class XmlMethodCall.*\?>\h*$' {} + |
xargs -0 perl -i.bak2 -wpne 's/\?>\h*$/RedefineForDocker::standardizeXmlmc();\n/gms'
