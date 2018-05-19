cd boot
for i in $*
do
  cd ../$i
  # mkdir -p /cache/$CI_PROJECT_PATH/$i/node_modules && ln -s /cache/$CI_PROJECT_PATH/$i/node_modules
  if command -v cnpm >/dev/null 2>&1; then
    cnpm install
  else
    npm install
  fi
done
