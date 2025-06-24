read -p Publishing as version "$1" '(argument 1)' once you press enter...
git tag v"$1"
git push
git push --tag
npm publish
