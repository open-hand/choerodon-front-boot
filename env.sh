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

if [ -f "${absolute_path}/.default.env" ]; then
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
fi

echo "}" >> ${env_config}
sed -e "s/\//\\\/g" ${env_config}
LINE=`echo $(cat ${env_config}) | sed 's#\/#\\\/#g'`
mv ${absolute_path}/index.html ${absolute_path}/index.html.bak
sed -e "s/window\.\_env\_.*\}\;/${LINE}/g" ${absolute_path}/index.html.bak > ${absolute_path}/index.html

if [ -a ${absolute_path}/registerOrganization.html ]; then
  mv ${absolute_path}/registerOrganization.html ${absolute_path}/registerOrganization.html.bak
  sed -e "s/window\.\_env\_.*\}\;/${LINE}/g" ${absolute_path}/registerOrganization.html.bak > ${absolute_path}/registerOrganization.html
fi

cat ${env_config}

exec "$@"
