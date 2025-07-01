version=v`npm pkg get version --workspaces=false | tr -d '"'`
read -p "Publishing as version $version (first argument to the publish command) once you press enter..."
# These are set up in approximate order of when you might want to be alerted that something is wrong.
#   Although it's hard to say that order holds exactly all the time.
git push && git tag "$version" && git push --tag && npm publish
