#!/bin/bash
set -x
set -e

# Recreate config file
absolute_path=$(cd `dirname $0`; pwd)
env_config=${absolute_path}/env-config.js

rm -rf ${env_config}
touch ${env_config}

# Add assignment 
echo "window._env_ = {" >> ${env_config}

# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}
  
  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> ${env_config}
done < ${absolute_path}/.env

while read -r line || [[ -n "$line" ]];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//')
  fi

  # Read value of current variable if exists as Environment variable
  value=$(printf '%s\n' "${!varname}")
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}
  
  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> ${env_config}
done < ${absolute_path}/.default.env

echo "}" >> ${env_config}
sed -e "s/\//\\\/g" ${env_config}
LINE=`echo $(cat ${env_config}) | sed 's#\/#\\\/#g'`
mv index.html index.html.bak
sed -e "s/window\.\_env\_.*\}\;/${LINE}/g" index.html.bak > index.html

cat ${env_config}

exec "$@"