#!/bin/bash -e

echo " _   _ ____  __  __   ____        _     _ _     _     _"
echo "| \ | |  _ \|  \/  | |  _ \ _   _| |__ | (_)___| |__ (_)_ __   __ _"
echo "|  \| | |_) | |\/| | | |_) | | | | '_ \| | / __| '_ \| | '_ \ / _\` |"
echo "| |\  |  __/| |  | | |  __/| |_| | |_) | | \__ \ | | | | | | | (_| |"
echo "|_| \_|_|   |_|  |_| |_|    \__,_|_.__/|_|_|___/_| |_|_|_| |_|\__, |"
echo "                                                              |___/ "

echo "This script will publish a new version to NPM, create a version bump git commit, tag it and push it."

branchName=`git rev-parse --abbrev-ref HEAD`
mainBranchName="main"

if [[ $branchName != ${mainBranchName} ]]; then
  echo "Current branch is $branchName. Only the main branch can be published."
  exit 1
fi

git config --global user.email "chrisbottin+bot@gmail.com"
git config --global user.name "chrisbottin Bot"

npm run compile
npm run test

npm version $VERSION_BUMP -m "Version Bump to %s ($VERSION_BUMP)"

newVersion=`npm view . --silent version`

git tag $newVersion

npm publish --provenance --ignore-scripts --verbose

git push origin $branchName
git push origin $newVersion
