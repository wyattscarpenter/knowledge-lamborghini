version="$1"
if [[ "$version" != v* ]]; then
  version="v$version"
fi
read -p "Publishing as version $version (first argument to the publish command) once you press enter..."
git tag "$version"
git push
git push --tag
npm publish
